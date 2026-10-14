import pytest
from fastapi.testclient import TestClient

from app.main import app
from scripts.reset_demo import reset_demo

client = TestClient(app)


@pytest.fixture(autouse=True)
def isolated_db(tmp_path, monkeypatch):
    monkeypatch.setenv("BRAND_MONITOR_DB_PATH", str(tmp_path / "reset.db"))


def test_reset_is_reproducible():
    assert reset_demo() == 5
    before = client.get("/api/mentions").json()
    assert len(before) == 5
    assert reset_demo() == 5
    after = client.get("/api/mentions").json()
    assert len(after) == 5
    assert [m["content"] for m in before] == [m["content"] for m in after]


def test_reset_refuses_non_sample_data():
    payload = {
        "brand": "Aurora", "content": "Aurora headphones", "platform": "Manual",
        "published_at": "2026-10-14T12:00:00Z", "is_sample": False,
    }
    assert client.post("/api/mentions", json=payload).status_code == 201
    with pytest.raises(RuntimeError, match="non-sample"):
        reset_demo()
    assert len(client.get("/api/mentions").json()) == 1
