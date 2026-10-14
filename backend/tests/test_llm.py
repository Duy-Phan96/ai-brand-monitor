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
