# AI Brand Monitor

AI Brand Monitor is an interview-focused MVP for turning unstructured online brand mentions into actionable marketing insights.

## MVP goals

- classify relevance, sentiment, topic, action requirement and priority (planned)
- present mentions in a responsive Material Design 3 inspired dashboard (planned)
- provide search, filters, detail views and source links (planned)
- generate concise summaries and suggested actions (planned)
- keep AI usage transparent and validated
- remain reproducible, testable and easy to explain in an interview

## Architecture

- Frontend: React, TypeScript, Vite, MUI
- Backend: Python, FastAPI, Pydantic
- Storage: SQLite (Python standard library)
- AI: provider-independent analysis service with structured outputs and deterministic fallback (planned)
- Testing: pytest, Vitest, Playwright (E2E planned)
- CI: GitHub Actions

## Local development

Requires Python 3.12+ and Node 22+.

Backend:

```bash
cd backend
python -m venv .venv
# Activate .venv for your operating system
python -m pip install -e ".[dev]"
uvicorn app.main:app --reload
```

Backend endpoints: `http://localhost:8000/docs`, `GET /api/health`, `GET /api/mentions`, `GET /api/mentions/{id}`, `POST /api/mentions`.

To seed five fictional example mentions in an **empty** database (from `backend/`):

```bash
python -m scripts.seed_demo
```

The SQLite database is stored under `backend/data/ai_brand_monitor.db` by default when starting in `backend/`. Override with `BRAND_MONITOR_DB_PATH`. Running the seed against a non-empty database leaves existing data untouched.

Frontend:

```bash
cd frontend
npm install
npm run dev
```

The initial frontend is only an application shell; backend/frontend integration is not complete.

## Tests

```bash
cd backend
pytest
```

```bash
cd frontend
npm run build
npm test
```

CI results must be verified on the PR before a milestone is marked complete.

## Source authenticity

All seeded examples are fictional. They contain no invented authentic-looking source links and are flagged `is_sample=true`. No product-level LLM inference exists yet; new mentions do not claim to have been analyzed.

## Documentation

See `ROADMAP.md`, `AGENTS.md`, `docs/architecture/`, `docs/decisions/`, `docs/development/` and `docs/presentation/`. A documented PowerPoint deck, PDF, German speaker notes and separate MVP demo are required final deliverables.
