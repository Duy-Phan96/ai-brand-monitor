# ADR 0003 — Deterministic fallback before LLM integration

## Context
The interview MVP needs reproducible classification with a clear explanation of which results come from an LLM and which do not.

## Alternatives
- Call an external LLM for every mention: richer results but API cost, downtime and variability.
- Use keywords only: fast and reliable but limited language understanding.
- Develop a model locally: too resource intensive for the target MVP.

## Decision
Introduce a deliberately limited English-language deterministic fallback, with `method=deterministic`, before implementing a provider-independent LLM adapter.

## Reasons
It enables a complete, offline-reproducible analysis path and creates a stable baseline for later comparing LLM results.

## Trade-offs and limitations
Keyword detection misses negations, irony, some ambiguous brands, non-English text and advanced context. Relevance has a specific safeguard for the fictional demo brand Aurora, not a general named-entity disambiguation strategy. Rules are intentionally conservative and not production-quality sentiment analysis. Priority is not identical to negative sentiment; a question can need action without being negative.

## Consequences
Document actual limitations in the UI and presentation. Add quality evaluations and improve the heuristic or LLM adapter before claiming general analysis accuracy.
