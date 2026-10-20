# Demo Script — Personal Acceptance and Interview Preparation

Updated 2026-10-20. Current deterministic flow; owner acceptance/rehearsal remain pending. Final PPTX/PDF/German notes follow acceptance.

## Safe preparation

Use a dedicated new acceptance database, never reset the existing personal/demo database. In the backend terminal, before starting the application:

```powershell
$env:PYTHON_DOTENV_DISABLED = '1'
$env:AI_PROVIDER = 'deterministic'
$env:AI_API_KEY = ''
$env:BRAND_MONITOR_DB_PATH = 'data/personal-acceptance-2026-10-20.db'
.\.venv\Scripts\python.exe -m scripts.seed_demo
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1
```

Run from `backend/`. If this acceptance path already contains wanted records, choose a different filename. Seed leaves nonempty storage untouched. Start frontend with `npm run dev -- --host 127.0.0.1` in a second terminal. Process-only settings leave `.env` unchanged; close the backend terminal when finished.

## Eight-minute live workflow

1. **0:00–1:00 — Scope:** show five fictional mentions and sample labels; platform names are illustrative, not connectors. All metrics come from stored rows.
2. **1:00–2:00 — Overview:** distinguish tone from urgency; explain activity in UTC, sentiment proportions and global KPI denominators. The chart is not a growth forecast.
3. **2:00–3:30 — Triage:** open attention queue, inspect a support complaint, then summary/relevance/topic/priority/recommendation. Open provenance and missing-source fallback. State that no response is automatically published.
4. **3:30–4:30 — Language:** change DE/EN with a filter/detail/draft present. Interface and displayed summary/explanation/recommendation change locally. Explain the notice: saved bilingual model text versus classification-derived legacy/rule wording. Original mention, classification and provenance stay; open the untranslated original analysis to inspect old nuance. Switching makes no API request or inference. Language alone persists on reload.
5. **4:30–6:00 — Entry:** add `Aurora headphones are fantastic and comfortable.` as fictional content. Confirm stored record, fresh rules analysis, success notice and actual counts. Explain shared 422 validation and explicit timezone/UTC normalization; the form sends an aware timestamp automatically.
6. **6:00–7:15 — Transfer:** export JSON and immediately upload that downloaded file within existing limits. Expect new records/new IDs and freshly computed analysis, never trusted exported provenance. Counts increase because import appends duplicates. Export CSV if time permits.
7. **7:15–8:00 — Limits/fallback:** classification rules are English-only and miss negation/sarcasm/German cases. Stored rule summaries are excerpts; the main bilingual view summarizes classification fields without translating the original excerpt. Show human-review guidance. Refer to recorded Gemini evidence separately.

## Recovery and data safety

If filters hide records, reset filters. If backend is unavailable, restart only the dedicated acceptance backend and use Retry/Refresh. Keep the offline provider selected; do not diagnose a presentation failure by sending live API requests. Screenshots and dated test evidence are a fallback if the local runtime fails, clearly labeled as recorded evidence.

Reset is optional and destructive to all fictional rows, including manual/imported examples. Only on the disposable acceptance database, after preserving wanted data, stop the backend and run `python -m scripts.reset_demo --confirm` in the same configured terminal. It refuses legacy non-sample data. This task did not reset personal data.

## Optional actual Gemini segment

The development journal records a successful service request on 2026-10-14 (HTTP 200, 6.86s, validated LLM method/model), not a verified live browser flow. No new Gemini generation was made for the audit/fixes. A new live segment needs a separately scoped decision and fictional input; inspect actual returned provenance and keep rules ready. Never expose `.env`, assume current quotas, or run a large Gemini-enabled import during the talk. The 45-second timeout is per phase and may exceed a comfortable demo wait.

## Acceptance record

Follow the audit checklist with its post-fix update and [analysis-language QA](../testing/ANALYSIS_LANGUAGE_QA.md) and the earlier P1 verification. Confirm restart persistence, DE/EN, keyboard/zoom and real-device usability manually. Record results against the same local source snapshot. The whole presentation/demo/Q&A target is 30 minutes; this flow occupies eight minutes.
