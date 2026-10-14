# ADR 0001 — MVP architecture

## Context
The assignment requires an interactive, mobile-friendly brand-monitoring MVP that is stable, explainable and demonstrable within interview constraints.

## Alternatives
1. Full TypeScript stack
2. React frontend with Python/FastAPI backend
3. Single Python application
4. Serverless-first architecture

## Decision
Use React + TypeScript + Vite + MUI for the frontend and FastAPI + Pydantic + SQLite for the backend.

## Reasons
- React/MUI supports a polished dashboard quickly.
- FastAPI/Pydantic provides explicit API schemas and strong validation.
- Python is a natural fit for future AI/classification work.
- SQLite minimizes infrastructure and keeps the demo reproducible.

## Trade-offs
Two runtimes add setup complexity, but separation improves clarity and mirrors realistic product architecture.

## Consequences
Frontend and backend require independent tests and startup commands. API contracts become an explicit project boundary.
