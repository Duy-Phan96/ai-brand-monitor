# Interview Q&A

## Why React and FastAPI?
React/MUI supports a polished responsive dashboard, while FastAPI/Pydantic gives explicit APIs and validation. Python also leaves a clean path for AI-related work.

## Why SQLite?
The MVP is low-volume and single-instance. SQLite keeps setup simple and reproducible without hiding the data model behind extra infrastructure.

## Why not integrate every platform?
ATZ confirmed representative sample data is sufficient. Live integrations add credentials, rate limits and failure modes that do not improve the core evaluation nearly as much as a stable monitoring workflow.

## How do you distinguish AI from rules?
Every analyzed mention records its analysis method and, where applicable, model metadata. A deterministic fallback is never labeled as genuine model inference.

## What would you improve with more time?
Live-source connectors, stronger evaluation datasets, background ingestion, richer alerting, authentication and a production database would come after the stable MVP.
