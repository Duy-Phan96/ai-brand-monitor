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

## New interactive monitoring controls
The frontend applies combined client-side filters against records returned from FastAPI. The filtering function is pure and independently tested. Users can constrain by content, sentiment, platform, topic, priority, action-needed status and publication date, then sort. Daily activity counts are derived directly from UTC publication dates.

The manual entry form sends a fictional mention through POST /api/mentions. FastAPI validates the input, runs transparent deterministic analysis, stores the result in SQLite and returns the record. The dashboard reloads to show the updated counts. This makes a useful end-to-end interview demo; no live social-media ingestion is implied.
