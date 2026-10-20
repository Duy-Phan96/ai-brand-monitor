# ADR 0004 — Data-driven dashboard and initial client filtering

## Context
The MVP must demonstrate overview metrics, discoverable mentions and transparent action prioritization.

## Alternatives
- Mock dashboard values: visually quick but misleading.
- Server-aggregated metrics and paginated filtering: scalable but more backend complexity.
- Compute metrics and filter from fetched mention records in React: simple and reproducible for a small demonstration dataset.

## Decision
Fetch persisted mentions via REST; calculate sentiment and topic counts on the client. Implement combined text, sentiment, platform and attention filters, and expandable analysis details.

## Rationale
All displayed counts derive from real stored data. The simple approach is easy to explain and validate, and it avoids introducing a second data contract prematurely.

## Historical decision scope
The following initial limitations describe this decision milestone, not current functionality. Filters, activity, entry/export and browser/axe checks were implemented later; see ADRs 0005–0012 and the current architecture. Executive summaries remain missing.

## Trade-offs
Client-side aggregation and full-list retrieval do not scale to large datasets. The initial view does not yet provide date/priority/topic filters, date activity visualization, manual input, export or executive summary; these remain tracked work. Browser-based visual and accessibility checks have not yet been conducted. Later server pagination and aggregation may become necessary.

## Follow-up
Add filtering and date-series visualizations, robust browser tests and refresh/error scenarios. Capture real screenshots only after a functional run.
