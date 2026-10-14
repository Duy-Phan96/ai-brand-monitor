from datetime import datetime, timezone

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.main import app
from app.schemas.mentions import MentionAnalysis, MentionCreate, Priority, Sentiment

client = TestClient(app)


@pytest.fixture(autouse=True)
def temporary_database(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("BRAND_MONITOR_DB_PATH", str(tmp_path / "test.db"))


def sample_payload() -> dict:
    return {
        "brand": "Aurora",
        "content": "The support team helped quickly.",
        "platform": "example",
        "published_at": "2026-10-01T12:00:00Z",
        "source_url": None,
        "is_sample": True,
    }


def test_create_list_and_get_mention() -> None:
    response = client.post("/api/mentions", json=sample_payload())
    assert response.status_code == 201
    created = response.json()
    assert created["id"] == 1
    assert created["analysis"] is None
    assert created["is_sample"] is True
    assert len(client.get("/api/mentions").json()) == 1
    assert client.get("/api/mentions/1").json()["content"] == sample_payload()["content"]


def test_missing_mention_returns_404() -> None:
    response = client.get("/api/mentions/999")
    assert response.status_code == 404


def test_input_validation_rejects_invalid_mention() -> None:
    payload = sample_payload()
    payload["brand"] = ""
    assert client.post("/api/mentions", json=payload).status_code == 422


def test_analysis_schema_rejects_invalid_sentiment() -> None:
    with pytest.raises(ValidationError):
        MentionAnalysis.model_validate(
            {
                "relevant": True,
                "sentiment": "enthusiastic",
                "topic": "support",
                "action_required": False,
                "priority": "low",
                "summary": "Support praise.",
                "explanation": "Positive feedback.",
                "method": "deterministic",
            }
        )
