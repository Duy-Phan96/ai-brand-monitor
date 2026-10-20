# ADR 0005 — Client-side filters, timeline and manual demo input

## Context
ATZ expects an interactive monitoring experience with useful filters and a convincing demonstrable workflow, even without external ingestion.

## Options
1. Server-driven filtering with query parameters and pagination.
2. Client-side filtering over a small SQLite-backed sample dataset.
3. Only static demo content.

## Decision
Implement pure client-side filtering and sorting over API mentions, combined by text, sentiment, platform, topic, priority, attention flag and inclusive UTC publication dates. Add a simple date activity visualization from actual stored records and a form that submits new fictional examples through the real backend API.

## Rationale
For the small MVP, a pure filtering function is easy to unit test and explain. The real API insertion demonstrates end-to-end input validation, classification, persistence and dashboard refresh. An activity visualization that uses dates from records avoids made-up statistics.

## Trade-offs
Retrieving all records and filtering locally is not suitable for large datasets. The simple progress bar visualization communicates relative counts but lacks the richness of a full charting library. The form currently creates fictional records only, does not provide authentication or editorial review, and assumes the device clock for its publication time. The UI must make these limitations explicit.

## Follow-up
Complete import/export, browser tests, dataset quality evaluation, responsive checks, privacy/security review and optional server pagination when justified.
