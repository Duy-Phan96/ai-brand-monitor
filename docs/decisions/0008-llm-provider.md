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
- At the original decision point, live service verification was pending. The journal later recorded one successful controlled service request on 2026-10-14; current availability, classifier quality and live browser inference remain unverified. Mock tests verify contracts only.
- Model response JSON mode does not guarantee our Pydantic schema; runtime validation remains mandatory.
- Prompt injection in incoming mentions remains a risk. The prompt declares external content untrusted; further red-team testing is required.
- Model prices, quotas, free-tier availability and data handling depend on the actual model and account. Verify against official documentation before enabling.
- Failures fall back silently for the end-user except for provenance/explanation; provider monitoring can be improved.
- No automatic retries, rate limits, caching, batching or spending controls yet. Do not enable paid billing without approval.

## Documentation for presentation
Explain clearly: AI-assisted development is different from runtime LLM inference. Show one deterministic example and one actual Gemini example only after live verification with configured credentials. Contrast explainability, accuracy, runtime dependency and cost.


## Follow-up decision — Timeout budget and offline test boundary (2026-10-14)
- Problem: the controlled Flash-Lite request raised ReadTimeout under the adapter's fixed 12-second HTTPX timeout. No status/body arrived, so provider latency, network stall and remote completion cannot be distinguished. No new live requests were made to investigate.
- Chose `AI_TIMEOUT_SECONDS` with a 45-second default and finite positive validation over a fixed larger value or retries. HTTPX applies this budget per connect/read/write/pool phase; it is not a strict total wall-clock deadline. Longer waits may delay synchronous request handling; retries remain disabled to avoid duplicate quota consumption.
- Disabled dotenv loading when `PYTHON_DOTENV_DISABLED=1`. Pytest conftest sets that flag, deterministic provider and an empty credential before importing test modules, regardless of inherited environment. Session guards reject HTTPX real transports and socket connections during collection and execution. MockTransport and in-process ASGI tests remain supported.
- Initial blanket socket guard broke Windows asyncio's internal loopback socketpair. Corrected with a thread-local exception confined to socketpair construction; ordinary loopback and external connect attempts remain rejected. This test policy is a regression guard, not an OS sandbox for arbitrary subprocesses or third-party native networking.
- Added regression tests: ordinary child pytest with hostile inherited Gemini settings, HTTP/socket blocking, timeout defaults/override/invalid values, simulated timeout/HTTP 429/transport failures, malformed JSON, missing candidates, invalid schema and non-object output; assertions verify single mock attempt, labeled fallback and secret-free logs.
- Failure logging records only a safe category and HTTP status, never exception messages, response bodies or headers. Successful response schema and provenance remain unchanged; redirects remain disabled.
- Verification: full backend suite 39 passed, one existing Starlette/httpx deprecation warning. No external requests occurred; Windows internal loopback socketpair IPC is allowed. No live Gemini call, billing, push, merge or deployment.
- Demonstration: explain that offline tests prove validation and fallback, not successful real inference. The 45-second setting prepares the adapter for a separately authorized controlled live test.
