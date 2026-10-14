# Secure local Gemini setup — free-tier project

## Preconditions
Google AI Studio must show the project in its **Free tier**. Check current model availability and request limits at https://aistudio.google.com/rate-limit and the official model pricing page. Free tier is subject to quota/rate limits and provider changes. Do not enable billing for this interview demonstration.

## Windows (PowerShell)
1. Clone the repo and open the repository root.
2. Run `Copy-Item .env.example .env`.
3. Open the local `.env` with your editor.
4. Set:
   ```dotenv
   AI_PROVIDER=gemini
   AI_MODEL=gemini-2.5-flash
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
- This guide is a configuration walkthrough, not evidence that live Gemini calls have been executed.
