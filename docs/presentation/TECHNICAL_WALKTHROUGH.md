# Technical Walkthrough — Living Notes

## Current architecture
React/TypeScript + MUI uses the Vite development server and its /api proxy to communicate with FastAPI. FastAPI validates mention records through Pydantic and stores them in SQLite.

## Monitoring flow
1. User loads the monitoring page.
2. The frontend requests GET /api/mentions.
3. FastAPI reads the SQLite records.
4. The response contains mention fields and optional analysis metadata.
5. React calculates counts from the returned dataset, never fabricated values.
6. The user filters records or expands a mention to inspect relevance, priority, recommendation and the deterministic analysis method.

## Why?
This is a deliberately small architecture: ideal for proving the user workflow before adding more complex ingestion and background processing.

## Known constraints
Full client-side retrieval is suitable only for the MVP. The dashboard does not yet implement every acceptance criterion. The current fallback uses conservative English-language rules, not an actual LLM. The fictional sample records have no external source URLs.
