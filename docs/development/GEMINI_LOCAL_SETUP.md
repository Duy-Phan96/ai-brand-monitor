# Secure local Gemini setup — free-tier project

## Current status
The optional adapter and bilingual prompt are implemented. The journal records one successful service-level request on 2026-10-14 after earlier failures. Current live availability, bilingual fidelity and live browser inference are unverified. Release preparation makes no generation requests. The diagnostic sections below are historical and superseded by later outcomes.

## Preconditions
Google AI Studio must show the project in its **Free tier**. Check current model availability and request limits at https://aistudio.google.com/rate-limit and the official model pricing page. Free tier is subject to quota/rate limits and provider changes. Do not enable billing for this interview demonstration.

## Windows (PowerShell)
1. Clone the repo and open the repository root.
2. Only if `.env` does not exist, run `Copy-Item .env.example .env`; never overwrite existing configuration.
3. Open the local `.env` with your editor.
4. Set:
   ```dotenv
   AI_PROVIDER=gemini
   AI_MODEL=gemini-3.1-flash-lite
   AI_TIMEOUT_SECONDS=45
   AI_API_KEY=your_key_from_google_ai_studio
   ```
5. Save the file. The repo ignores `.env`.
6. Follow README backend setup instructions. Start backend from `backend/` with `uvicorn app.main:app --reload`.
7. Use the Swagger UI at `http://localhost:8000/docs` to submit a fictional `POST /api/mentions` record. Verify its `analysis.method`: `llm` means a validated real model response; `deterministic` indicates fallback.

## Offline fallback
Set `AI_PROVIDER=deterministic` to avoid external requests entirely. Missing/invalid credentials, errors and invalid responses trigger local rule-based analysis rather than an unhandled crash. The `analysis.method` remains transparent.

## Security, privacy and cost
- Never paste your API key into ChatGPT, issues, commits, screenshots or logs.
- Never set billing solely for this MVP. The app cannot guarantee that an externally billed account would not incur fees; keeping the project on Google's free tier is the cost control.
- Run only a few tests and inspect your Google AI Studio quota.
- Only use fictional test mentions; do not transmit personal/customer data through a free-tier API.
- The adapter makes a network request only if `AI_PROVIDER=gemini` is configured.
- One controlled real Flash-Lite inference is now verified; see the dated result below. Earlier attempts are retained as historical findings.


## Verified local diagnostic status — 2026-10-14
Two real `gemini-2.5-flash` requests returned HTTP 404 (`NOT_FOUND`) and safely fell back to deterministic analysis. A subsequent authenticated Models API listing returned HTTP 200 and included that exact model with `generateContent`. The 404 cause remains unresolved; listing a model does not guarantee inference access or nonzero quota.

`gemini-3.1-flash-lite` is a provisional lightweight alternative reported by the Models API. Google's [pricing](https://ai.google.dev/gemini-api/docs/pricing) and [model documentation](https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-lite) advertise free-tier text generation and structured output. Before switching, confirm this key's project is Free tier and check its actual RPM/TPM/RPD and remaining usage in [AI Studio](https://aistudio.google.com/rate-limit). Those project-specific checks currently require user sign-in. No extra generation request or `.env` change was made during discovery. Live `method=llm` and model JSON/Pydantic validation remain pending.


## Latest verification attempt — 2026-10-14
The owner confirmed Free Tier and `gemini-3.1-flash-lite` limits of 15 RPM, 250,000 TPM and 500 RPD. The root local `.env` now selects this exact Models-API-listed identifier. One controlled request through the existing adapter timed out (`httpx.ReadTimeout`, 12-second configured timeout); no HTTP status or structured model JSON was received. Result: `method=deterministic`, `model_name=null`, with explicit fallback explanation. Live `method=llm` remains unverified.

Run backend tests offline even when `.env` contains live credentials:
```powershell
$env:AI_PROVIDER = 'deterministic'
.\.venv\Scripts\python.exe -m pytest -q
Remove-Item Env:AI_PROVIDER
```
Latest offline result: 23 passed, 1 deprecation warning. An initial test invocation inherited live Gemini configuration and could have made extra requests before being stopped; the overall one-request budget cannot be certified. Do not rerun live tests without a new allowance, and inspect AI Studio usage. Client timeout is not proof of a provider-access or quota error.


## Timeout and automated-test safety
`AI_TIMEOUT_SECONDS` defaults to 45 seconds; override with a positive finite value in the local `.env`. This configures HTTPX timeouts per phase, not a total request deadline. Invalid settings fall back without a request. No automatic retries are performed. Restart the backend after configuration changes.

Ordinary `python -m pytest` from `backend/` now ignores local dotenv settings and inherited live Gemini configuration. The suite clears credentials, defaults to deterministic analysis, and blocks real HTTPX/socket connections. Provider tests explicitly opt into mocked responses. Manual environment overrides are no longer required for test safety. The earlier failed attempts remain historical findings; a successful live `method=llm` result is still pending.

Offline validation: 39 passed, one existing Starlette/httpx deprecation warning. No external network/Gemini requests were made; internal Windows asyncio loopback IPC is allowed.



## Controlled live Gemini verification — 2026-10-14
- Configuration verified: `AI_PROVIDER=gemini`, `AI_MODEL=gemini-3.1-flash-lite`, `AI_TIMEOUT_SECONDS=45`. Added the explicit timeout to ignored local `.env` where previously only the application default applied; the key was preserved and never printed.
- Exactly one real generation request used the existing unchanged application adapter and a fictional Aurora headphones mention. No retry, additional discovery or other live generation request. HTTP 200 in 6.86 seconds; TCP and TLS completed, finish reason STOP.
- Provider JSON object parsed successfully and validated through MentionAnalysis/Pydantic. Application provenance: `method=llm`, `model_name=gemini-3.1-flash-lite`. Classification: relevant=true, sentiment=positive, topic=product feedback, action_required=false, priority=low, suggested_action=null. Summary: Customer expressed high satisfaction with Aurora headphones.
- Usage reported: 175 prompt tokens, 92 response tokens, 267 total tokens. Free Tier and project limits (15 RPM, 250,000 TPM, 500 RPD) were confirmed by the owner; no billing/account changes. The response's standard service tier is not independent proof of billing tier.
- Ordinary offline pytest with session network guards: 39 passed, one existing Starlette/httpx deprecation warning in 2.50s. pip check passed. No external network requests during tests; Windows internal socketpair IPC remains allowed.
- Real inference is now verified at the application-service boundary. Ready for a small controlled optional LLM demo with deterministic fallback retained. This is one positive sample, not classifier-quality evidence, a negative live test, throughput proof or end-to-end browser QA. Earlier 404 and 12-second timeout causes remain unresolved; this success does not prove the timeout change caused success.
- API key sent only to the configured Gemini endpoint in a header. No source changes, pushes, merges or deployment in this verification.
