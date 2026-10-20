"""Regression coverage for the fictional-only UTC input and safe transfer contract."""
import json
from datetime import datetime, timezone

import pytest
from fastapi.testclient import TestClient

from app.core.database import connect
from app.main import app
from app.schemas.mentions import MentionCreate

client = TestClient(app)


def row(**changes):
    return {
        "brand": "Aurora", "content": "Aurora headphones are fantastic.",
        "platform": "Fictional forum", "published_at": "2026-10-14T12:00:00Z",
        "source_url": None, "is_sample": True, **changes,
    }


def write(endpoint, payload):
    return client.post(endpoint, json={"mentions": [row(), payload]} if endpoint.endswith("import") else payload)


@pytest.mark.parametrize("endpoint", ["/api/mentions", "/api/mentions/import"])
@pytest.mark.parametrize("field", ["brand", "content", "platform"])
@pytest.mark.parametrize("value", ["", " \t\r\n\u2003\u00a0", None, 12, {}, [], "bad\x00text"])
def test_invalid_required_text_rejected_before_analysis(endpoint, field, value, monkeypatch):
    def unexpected(*args):
        pytest.fail("Invalid batch reached analysis")
    monkeypatch.setattr("app.api.mentions.analyze_mention", unexpected)
    monkeypatch.setattr("app.api.transfer.analyze_mention", unexpected)
    response = write(endpoint, row(**{field: value}))
    assert response.status_code == 422
    assert response.json()["detail"][-1]["loc"][-1] == field
    assert client.get("/api/mentions").json() == []


@pytest.mark.parametrize("endpoint", ["/api/mentions", "/api/mentions/import"])
@pytest.mark.parametrize("value", [False, "false", "true", 0, 1, None])
def test_only_actual_sample_boolean_allowed(endpoint, value):
    response = write(endpoint, row(is_sample=value))
    assert response.status_code == 422
    assert client.get("/api/mentions").json() == []


@pytest.mark.parametrize("endpoint", ["/api/mentions", "/api/mentions/import"])
@pytest.mark.parametrize("timestamp", ["2026-10-14T12:00:00", "2026-10-14", "1791979200", 1791979200, None, "not-a-date", "9999-12-31T23:59:59-01:00", "0001-01-01T00:00:00+01:00"])
def test_explicit_timezone_required(endpoint, timestamp):
    assert write(endpoint, row(published_at=timestamp)).status_code == 422
    assert client.get("/api/mentions").json() == []


def test_unicode_text_normalized_and_utc_stored_for_create_and_import():
    text = "  Aurora Kopfhörer — großartig! 日本語 🎧\nSecond line.  "
    payload = row(brand="\tAurora\u2003", content=text, platform="  Fiktives Forum  ",
                  published_at="2026-10-14T00:30:00+02:00")
    response = client.post("/api/mentions", json=payload)
    assert response.status_code == 201
    record = response.json()
    assert (record["brand"], record["content"], record["platform"]) == ("Aurora", text.strip(), "Fiktives Forum")
    assert record["published_at"] == "2026-10-13T22:30:00Z"
    assert client.post("/api/mentions/import", json={"mentions": [payload]}).status_code == 200
    with connect() as connection:
        assert [item[0] for item in connection.execute("SELECT published_at FROM mentions")] == ["2026-10-13T22:30:00+00:00"] * 2
    assert MentionCreate.model_validate(row(published_at=datetime(2026, 10, 14, tzinfo=timezone.utc))).published_at.tzinfo == timezone.utc


@pytest.mark.parametrize("endpoint", ["/api/mentions", "/api/mentions/import"])
def test_malformed_unicode_and_json_return_422(endpoint):
    payload = row(content="\ud800")
    body = {"mentions": [payload]} if endpoint.endswith("import") else payload
    response = client.post(endpoint, content=json.dumps(body), headers={"Content-Type": "application/json"})
    assert response.status_code == 422
    assert "input" not in response.json()["detail"][0]
    assert client.post(endpoint, content="{broken", headers={"Content-Type": "application/json"}).status_code == 422
    assert client.get("/api/mentions").json() == []


def test_export_import_roundtrip_allocates_ids_and_reanalyzes():
    original = client.post("/api/mentions", json=row()).json()
    exported = client.get("/api/mentions/export?format=json").json()
    assert client.post("/api/mentions/import", json=exported).json() == {"imported": 1}
    records = client.get("/api/mentions").json()
    assert len(records) == 2
    assert {item["id"] for item in records} == {1, 2}
    for item in records:
        assert {k: v for k, v in item.items() if k != "id"} == {k: v for k, v in original.items() if k != "id"}
    # Even malformed/forged metadata is discarded, never persisted or executed.
    exported["mentions"][0].update(id=999999, analysis={"method": "human", "summary": "forged"})
    assert client.post("/api/mentions/import", json=exported).status_code == 200
    latest = client.get("/api/mentions/3").json()
    assert latest["analysis"]["method"] == "deterministic"
    assert latest["analysis"]["summary"] != "forged"
    assert client.get("/api/mentions/999999").status_code == 404


def test_unknown_fields_rejected_and_existing_data_preserved():
    original = client.post("/api/mentions", json=row()).json()
    for bad in [row(unexpected=True), row(is_sample=False), row(content="  "), row(published_at="2026-10-14")]:
        assert client.post("/api/mentions/import", json={"mentions": [row(), bad]}).status_code == 422
        assert client.get("/api/mentions").json() == [original]
    assert client.post("/api/mentions", json={**row(), "analysis": {}}).status_code == 422
