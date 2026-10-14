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
   SQLite    Analysis service
                  |
        deterministic fallback
                  |
          optional LLM provider
```

## Responsibilities

### Frontend
Responsible for presentation, navigation, filters, responsive interaction and user feedback.

### Backend
Owns API validation, persistence, analysis orchestration, import/export and all secret-bearing integrations.

### Storage
SQLite is sufficient for the MVP because the demo is single-instance, low-volume and interview-oriented. The data layer should remain replaceable.

### AI analysis
AI-specific logic must sit behind a provider-independent service interface. Structured responses are validated before persistence. The system must expose the analysis method so deterministic fallback cannot be mistaken for actual model inference.

## Security boundaries
Imported mention content is untrusted. API inputs and model outputs are validated. Provider keys remain backend-only.

## Deployment
Local reproducibility is the priority. Deployment is intentionally deferred until the MVP is stable.
