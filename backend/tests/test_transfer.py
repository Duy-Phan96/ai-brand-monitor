import csv
import io
import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


@pytest.fixture(autouse=True)
def temporary_db(tmp_path, monkeypatch):
    monkeypatch.setenv("BRAND_MONITOR_DB_PATH", str(tmp_path / "transfer.db"))


def row(content="Aurora headphones are fantastic"):
    return {
        "brand": "Aurora", "content": content, "platform": "Fictional forum",
        "published_at": "2026-10-14T10:00:00Z", "source_url": None, "is_sample": True,
    }


def test_json_import_and_both_exports():
    response = client.post("/api/mentions/import", json={"mentions": [row(), row("Aurora headphones stopped charging")]})
    assert response.status_code == 200
    assert response.json() == {"imported": 2}
    exported = client.get("/api/mentions/export?format=json")
    assert exported.status_code == 200
    assert len(exported.json()["mentions"]) == 2
    assert all(m["analysis"]["method"] == "deterministic" for m in exported.json()["mentions"])
    csv_response = client.get("/api/mentions/export?format=csv")
    values = list(csv.DictReader(io.StringIO(csv_response.text)))
    assert len(values) == 2
    assert values[0]["brand"] == "Aurora"


def test_invalid_record_rolls_back_batch():
    invalid = {**row(), "source_url": "javascript:alert(1)"}
    result = client.post("/api/mentions/import", json={"mentions": [row(), invalid]})
    assert result.status_code == 422
    assert client.get("/api/mentions").json() == []


def test_non_sample_import_rejected():
    result = client.post("/api/mentions/import", json={"mentions": [{**row(), "is_sample": False}]})
    assert result.status_code == 422


def test_invalid_export_type_rejected():
    assert client.get("/api/mentions/export?format=xml").status_code == 422


def test_empty_import_rejected():
    assert client.post("/api/mentions/import", json={"mentions": []}).status_code == 422
