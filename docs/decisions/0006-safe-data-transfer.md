# ADR 0006 — Safe import and export for the interview MVP

## Context
The assignment calls for import/export without relying on live social-platform integrations. Imported text may be malicious or malformed.

## Alternatives
1. JSON-only imports and exports
2. CSV import/export with free-form column parsing
3. Validated JSON import plus JSON and CSV exports

## Decision
Implement validated JSON batch import, with a limit of 500 records per request. Each input is validated by Pydantic and receives fresh analysis through the server-selected application provider (deterministic by default). Preserve transaction atomicity. Export the full stored dataset as JSON or CSV.

## Rationale
JSON preserves explicit field types and permits dependable validation; CSV export supports common spreadsheet workflows without adding CSV import complexity. Requiring the sample flag avoids suggesting imported posts are verified live social data.

## Security and limitations
- Input URLs require Pydantic HttpUrl validation.
- The batch is validated before the database is written.
- CSV values beginning with spreadsheet formula triggers are prefixed to mitigate formula injection.
- JSON input size is constrained in the UI (1 MB) but **not yet by the API request-body layer**; a server-side body-size limit remains future hardening work.
- No deduplication, user accounts, or authenticated editing; this is a local interview MVP.
- The exported analysis is existing metadata, not an LLM inference claim.

## 2026-10-20 follow-up
ADR 0012 adds unchanged export/reimport compatibility: discard IDs/analysis before validation, allocate new insert IDs and recompute analysis; append duplicates intentionally. Shared fictional/nonblank/aware-UTC validation applies to both write endpoints. Existing record/file limits and lack of deduplication remain. No existing data was migrated.

## Interview explanation
The key trade-off: we favor a predictable, correctly validated, demonstrable transfer pipeline over supporting numerous external file formats or unreliable live integrations.
