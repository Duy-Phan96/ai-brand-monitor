# System Architecture

## Overview
AI Brand Monitor uses a small client/server architecture suited to an interview MVP.

```text
React + TypeScript + MUI
          |
        REST
          |
FastAPI + Pydantic
     |          |
   SQLite    Analysis service (planned)
                  |
       deterministic fallback (planned)
                  |
          optional LLM provider (planned)
```

## Responsibilities

### Frontend
Responsible for presentation, navigation, filters, responsive interaction and user feedback. The current implementation is a shell only.

### Backend
Owns API validation, persistence and eventually analysis orchestration, import/export and integrations.

### Storage
SQLite is sufficient for the MVP because the demo is single-instance, low-volume and interview-oriented. The current `mentions` table stores validated input fields and an optional serialized analysis. The database is initialized lazily. Migrations, normalized analysis data and advanced queries are future work.

### API
- `GET /api/health`: health check.
- `GET /api/mentions`: list mentions newest first.
- `GET /api/mentions/{id}`: retrieve a mention or 404.
- `POST /api/mentions`: validate and store a mention.

### Demo data
`backend/data/sample_mentions.json` contains clearly fictional brand examples with missing source URLs rather than invented real posts. `python -m scripts.seed_demo` only seeds an empty database.

### AI analysis
A provider-independent service is planned but not yet implemented. Structured responses must be validated before persistence. No synthetic inference is claimed to have been run.

## Security boundaries
Imported content is untrusted. API input is validated and SQL statements are parameterized. Provider keys must remain backend-only.

## Deployment
Local reproducibility is the priority. Deployment is intentionally deferred until the MVP is stable.
