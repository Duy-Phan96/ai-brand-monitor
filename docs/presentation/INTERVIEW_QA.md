# Interview Q&A

## Why React and FastAPI?
React/MUI supports a polished responsive dashboard, while FastAPI/Pydantic gives explicit APIs and validation. Python also leaves a clean path for AI-related work.

## Why SQLite?
The MVP is low-volume and single-instance. SQLite keeps setup simple and reproducible without hiding the data model behind extra infrastructure.

## Why not integrate every platform?
The owner explicitly limited the final MVP to fictional data. Internal notes record sample-data sufficiency, but the original assignment document still needs confirmation. Live connectors are outside this acceptance scope and would add credentials, rate limits and failure modes.

## How do you distinguish AI from rules?
Every analyzed mention records its analysis method and, where applicable, model metadata. A deterministic fallback is never labeled as genuine model inference.

## What would you improve with more time?
Live-source connectors, stronger evaluation datasets, background ingestion, richer alerting, authentication and a production database would come after the stable MVP.

## Why discard analysis and IDs when importing an export?
An export preserves evidence for inspection, but neither its identities nor its analysis is authoritative input. Import discards only those fields, validates the input, recomputes analysis through the configured provider and appends new records. It is not an upsert or a faithful backup restore. Existing 1–500-record and 1 MB browser limits remain.

## How is fictional-only input enforced?
Both write endpoints share the same validation: false/non-boolean sample flags are rejected with 422, never relabeled. The default omitted flag is true; the owner must still supply fictional text because a flag cannot prove authenticity. Legacy non-sample rows remain readable and prevent reset.

## Why require a timezone?
A naive timestamp can refer to different instants on different computers. New inputs require an explicit zone and normalize to UTC for storage/activity/filtering. The server does not guess or migrate old timestamps. Browser regressions compare Berlin and Los Angeles behavior.

## Does Pydantic prove the AI is correct?
No. It validates structure and allowed field values; backend code assigns provenance. Semantic consistency, truth, prompt-injection resistance and multilingual accuracy need separate evaluation. The English fallback has known negation/German/sarcasm failures.

## What is actually verified about Gemini?
One controlled service-level request was recorded as successful on 2026-10-14. Current tests are offline and mocked/deterministic, including browser LLM labels. They do not establish live browser availability. The timeout is 45 seconds per HTTPX phase, not a total deadline; no automatic retries occur.

## What did the AI-assisted process get wrong and correct?
The journal records an earlier test-isolation mistake that could have used the live provider; offline network and credential guards were added. During the P1 fixes, new browser tests initially used the wrong chart label and assumed IDs reset after DELETE. The tests were corrected without changing the design. Human acceptance remains pending; no productivity metrics or approvals are invented.

## Why do old analyses have generic localized descriptions?
Arbitrary old model prose has no saved translation. Automatically recreating one would require a translation engine or paid inference and might change evidence. We preserve originals, label classification-derived text honestly and keep original nuance inspectable. New Gemini prompts request both languages in one response; schema validation does not prove translation quality. Switching merely chooses local wording and sends no API request.

## Does green CI cover the current application?
Historical CI results apply only to their exact commits. The complete MVP is prepared in PR #1 with backend/frontend/audit/E2E/release-hygiene jobs; inspect current head checks before merging. Fresh local validation and release limits are in docs/releases/RELEASE_PREPARATION.md. Personal acceptance and final deck remain pending.
