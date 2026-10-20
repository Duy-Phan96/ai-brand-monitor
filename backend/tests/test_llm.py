import httpx

from app.services.llm import analyze_mention


def test_default_uses_rules(monkeypatch):
    monkeypatch.delenv("AI_PROVIDER", raising=False)
    assert analyze_mention("Aurora", "Aurora headphones are fantastic.").method == "deterministic"


def test_missing_key_uses_fallback(monkeypatch):
    monkeypatch.setenv("AI_PROVIDER", "gemini")
    monkeypatch.delenv("AI_API_KEY", raising=False)
    monkeypatch.setenv("AI_MODEL", "gemini-2.5-flash")
    result = analyze_mention("Aurora", "Aurora headphones are fantastic.")
    assert result.method == "deterministic"
    assert "fallback" in result.explanation


def test_valid_model_json_is_validated_and_marked_llm(monkeypatch):
    monkeypatch.setenv("AI_PROVIDER", "gemini")
    monkeypatch.setenv("AI_API_KEY", "test-only")
    monkeypatch.setenv("AI_MODEL", "gemini-2.5-flash")

    class FakeResponse:
        def raise_for_status(self): pass
        def json(self):
            return {"candidates": [{"content": {"parts": [{"text": (
                '{"relevant":true,"sentiment":"positive","topic":"product",'
                '"action_required":false,"priority":"low","summary":"Praise",'
                '"explanation":"Positive wording","suggested_action":null,'
                '"method":"deterministic","model_name":null}'
            )}]}}]}

    class FakeClient:
        def __init__(self, **kwargs): pass
        def __enter__(self): return self
        def __exit__(self, *args): pass
        def post(self, *args, **kwargs): return FakeResponse()

    monkeypatch.setattr("app.services.llm.httpx.Client", FakeClient)
    result = analyze_mention("Aurora", "Aurora headphones are fantastic")
    assert result.method == "llm"
    assert result.model_name == "gemini-2.5-flash"


def test_invalid_model_output_falls_back(monkeypatch):
    monkeypatch.setenv("AI_PROVIDER", "gemini")
    monkeypatch.setenv("AI_API_KEY", "test-only")
    monkeypatch.setenv("AI_MODEL", "gemini-2.5-flash")

    class FakeResponse:
        def raise_for_status(self): pass
        def json(self):
            return {"candidates": [{"content": {"parts": [{"text": '{"sentiment":"unknown"}'}]}}]}

    class FakeClient:
        def __init__(self, **kwargs): pass
        def __enter__(self): return self
        def __exit__(self, *args): pass
        def post(self, *args, **kwargs): return FakeResponse()

    monkeypatch.setattr("app.services.llm.httpx.Client", FakeClient)
    assert analyze_mention("Aurora", "Aurora headphones").method == "deterministic"


import json
import pytest
from app.services import llm


@pytest.mark.parametrize("setting,expected", [(None, 45.0), ("60", 60.0)])
def test_configurable_timeout(monkeypatch, setting, expected):
    if setting is None:
        monkeypatch.delenv("AI_TIMEOUT_SECONDS", raising=False)
    else:
        monkeypatch.setenv("AI_TIMEOUT_SECONDS", setting)
    assert llm._request_timeout() == expected


@pytest.mark.parametrize("setting", ["0", "-1", "nan", "inf", "bad"])
def test_invalid_timeout_falls_back_before_request(monkeypatch, setting):
    monkeypatch.setenv("AI_PROVIDER", "gemini")
    monkeypatch.setenv("AI_API_KEY", "fake-test-only")
    monkeypatch.setenv("AI_MODEL", "gemini-3.1-flash-lite")
    monkeypatch.setenv("AI_TIMEOUT_SECONDS", setting)
    result = analyze_mention("Aurora", "Aurora headphones are fantastic")
    assert result.method == "deterministic"
    assert "invalid_response_or_configuration" in result.explanation


@pytest.mark.parametrize("kind,category", [
    ("timeout", "timeout"), ("http", "http_error"),
    ("transport", "transport_error"), ("invalid_json", "invalid_response_or_configuration"),
    ("missing_candidates", "invalid_response_or_configuration"),
    ("schema", "invalid_response_or_configuration"),
    ("non_object", "invalid_response_or_configuration"),
])
def test_failure_categories_without_network(monkeypatch, caplog, kind, category):
    monkeypatch.setenv("AI_PROVIDER", "gemini")
    monkeypatch.setenv("AI_API_KEY", "fake-secret-not-for-logs")
    monkeypatch.setenv("AI_MODEL", "gemini-3.1-flash-lite")
    real_client = httpx.Client
    calls = []

    def handler(request):
        calls.append(request)
        if kind == "timeout":
            raise httpx.ReadTimeout("fake-secret-not-for-logs", request=request)
        if kind == "transport":
            raise httpx.ConnectError("fake-secret-not-for-logs", request=request)
        if kind == "http":
            return httpx.Response(429, json={"error": "fake-secret-not-for-logs"})
        if kind == "missing_candidates":
            return httpx.Response(200, json={})
        raw = {"invalid_json": "not json", "schema": '{"sentiment":"wrong"}',
               "non_object": "[]"}[kind]
        return httpx.Response(200, json={"candidates": [{"content": {"parts": [{"text": raw}]}}]})

    def client(**kwargs):
        assert kwargs["timeout"] == 45.0
        assert kwargs["follow_redirects"] is False
        return real_client(transport=httpx.MockTransport(handler), **kwargs)

    monkeypatch.setattr(llm.httpx, "Client", client)
    result = analyze_mention("Aurora", "Aurora headphones are fantastic")
    assert result.method == "deterministic"
    assert category in result.explanation
    assert len(calls) == 1  # No retries, including quota errors.
    assert "fake-secret-not-for-logs" not in caplog.text
    if kind == "http":
        assert "status=429" in caplog.text
