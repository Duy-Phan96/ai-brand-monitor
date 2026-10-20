import json

import httpx
import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.core.database import connect, initialize_database
from app.main import app
from app.schemas.mentions import MentionAnalysis
from app.services import llm
from app.services.analysis import analyze

client = TestClient(app)


def bilingual():
    return {
        "de": {"summary": "Eine Supportbeschwerde.", "explanation": "Der Beitrag beschreibt einen Defekt.", "suggested_action": "Prüfen Sie den Defekt."},
        "en": {"summary": "A support complaint.", "explanation": "The mention describes a defect.", "suggested_action": "Review the defect."},
    }


def test_single_mock_generation_persists_both_languages_without_read_requests(monkeypatch):
    monkeypatch.setenv("AI_PROVIDER", "gemini")
    monkeypatch.setenv("AI_API_KEY", "fake-test-only")
    monkeypatch.setenv("AI_MODEL", "test-model")
    result = analyze("Aurora", "Aurora headphones are broken.").model_dump(mode="json")
    result["localized_text"] = bilingual()
    calls = []
    real_client = httpx.Client

    def handler(request):
        calls.append(request)
        payload = json.loads(request.content)
        assert "localized_text" in payload["systemInstruction"]["parts"][0]["text"]
        assert payload["generationConfig"]["maxOutputTokens"] == 1600
        return httpx.Response(200, json={"candidates": [{"content": {"parts": [{"text": json.dumps(result)}]}}]})

    monkeypatch.setattr(llm.httpx, "Client", lambda **kwargs: real_client(transport=httpx.MockTransport(handler), **kwargs))
    original = "Aurora headphones are broken."
    created = client.post("/api/mentions", json={
        "brand": "Aurora", "content": original, "platform": "Fictional",
        "published_at": "2026-10-20T12:00:00Z", "is_sample": True,
    })
    assert created.status_code == 201
    record = created.json()
    assert record["analysis"]["localized_text"] == bilingual()
    assert record["analysis"]["method"] == "llm"
    assert record["analysis"]["model_name"] == "test-model"
    assert record["content"] == original
    assert client.get("/api/mentions/export?format=json").json()["mentions"] == [record]
    csv = client.get("/api/mentions/export?format=csv")
    assert csv.status_code == 200
    assert "localized_text" not in csv.text.splitlines()[0]
    for language in ("de", "en", "de"):
        listed = client.get("/api/mentions", headers={"Accept-Language": language}).json()
        assert listed == [record]
        assert client.get(f"/api/mentions/{record['id']}").json() == record
    assert len(calls) == 1


@pytest.mark.parametrize("change", ["missing_language", "blank", "extra", "wrong_type"])
def test_bilingual_text_requires_complete_valid_pair(change):
    text = bilingual()
    if change == "missing_language":
        del text["de"]
    elif change == "blank":
        text["de"]["explanation"] = "  "
    elif change == "extra":
        text["en"]["method"] = "human"
    else:
        text["en"]["summary"] = []
    with pytest.raises(ValidationError):
        MentionAnalysis.model_validate({**analyze("Aurora", "Aurora headphones").model_dump(), "localized_text": text})


@pytest.mark.parametrize("method", ["llm", "deterministic", "human"])
def test_legacy_analysis_read_does_not_rewrite_database_or_reanalyse(method, monkeypatch):
    def unexpected(*args):
        pytest.fail("Reading existing records must not generate analysis")
    monkeypatch.setattr("app.api.mentions.analyze_mention", unexpected)
    initialize_database()
    legacy = analyze("Aurora", "Aurora headphones are fantastic.").model_dump(mode="json")
    legacy.pop("localized_text")
    legacy.update(method=method, model_name="original-model" if method == "llm" else None)
    raw = json.dumps(legacy)
    with connect() as connection:
        connection.execute(
            """INSERT INTO mentions (brand, content, platform, published_at, is_sample, analysis_json)
            VALUES (?, ?, ?, ?, ?, ?)""",
            ("Aurora", "Original content — unverändert 🎧", "Fictional", "2026-10-14T12:00:00Z", 1, raw),
        )
    for _ in range(2):
        record = client.get("/api/mentions").json()[0]
        assert record["content"] == "Original content — unverändert 🎧"
        assert record["analysis"] == {**legacy, "localized_text": None}
    with connect() as connection:
        assert connection.execute("SELECT analysis_json FROM mentions").fetchone()[0] == raw
