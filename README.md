# AI Brand Monitor

AI Brand Monitor is an interview-focused MVP for turning unstructured online brand mentions into actionable marketing insights.

## MVP goals

- classify relevance, sentiment, topic, action requirement and priority
- present mentions in a responsive Material Design 3 inspired dashboard
- provide search, filters, detail views and source links
- generate concise summaries and suggested actions
- keep AI usage transparent and validated
- remain reproducible, testable and easy to explain in an interview

## Planned architecture

- Frontend: React, TypeScript, Vite, MUI
- Backend: Python, FastAPI, Pydantic
- Storage: SQLite
- AI: provider-independent analysis service with structured outputs and deterministic fallback
- Testing: pytest, Vitest, Playwright
- CI: GitHub Actions

## Repository status

Current milestone: **Phase 1 — Application foundation**

The repository baseline, engineering rules and project roadmap are being established on `feat/project-foundation`.

## Development principles

Quality over quantity. No fake business metrics, no fake source URLs, no simulated AI results presented as real inference, and no secrets committed to Git.

See `ROADMAP.md`, `AGENTS.md` and `docs/` for project details.
