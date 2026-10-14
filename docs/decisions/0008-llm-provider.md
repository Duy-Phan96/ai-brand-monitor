# ADR 0008 — Optional Gemini API with deterministic fallback

## Context
ATZ welcomes actual model inference, but the MVP must remain stable and demonstrate AI transparency even if the provider is unavailable.

## Alternatives
1. Only keyword rules: reproducible, but limited language understanding.
2. Always invoke external LLM: richer classification, but API dependency, costs and errors.
3. Optional server-side external provider with validated output and offline fallback: selected.
4. Local Ollama: resource intensive for the small existing VPS; deferred.

## Decision
Add a provider-independent service entrypoint and a Gemini REST adapter selected by AI_PROVIDER=gemini. AI_API_KEY and AI_MODEL are server-side environment variables. Default remains AI_PROVIDER=deterministic. The application validates JSON via Pydantic and itself sets method=llm/model_name after successful validation. When a provider fails or returns invalid data, clearly fall back to method=deterministic and label the explanation.

## Why
The core dashboard stays reproducible without network or paid dependencies, while real inference can be demonstrated when credentials are configured. A thin HTTP client adds little package complexity. The API output schema is explicit and auditable.

## Risks and limitations
- Not yet tested against the live Gemini service: mocked API tests verify the integration contract, not real-world availability.
- Model response JSON mode does not guarantee our Pydantic schema; runtime validation remains mandatory.
- Prompt injection in incoming mentions remains a risk. The prompt declares external content untrusted; further red-team testing is required.
- Model prices, quotas, free-tier availability and data handling depend on the actual model and account. Verify against official documentation before enabling.
- Failures fall back silently for the end-user except for provenance/explanation; provider monitoring can be improved.
- No automatic retries, rate limits, caching, batching or spending controls yet. Do not enable paid billing without approval.

## Documentation for presentation
Explain clearly: AI-assisted development is different from runtime LLM inference. Show one deterministic example and one actual Gemini example only after live verification with configured credentials. Contrast explainability, accuracy, runtime dependency and cost.
