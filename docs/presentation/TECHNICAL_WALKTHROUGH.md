# Technical Walkthrough

Current implementation, 2026-10-20. See ADR 0012 and the P1 verification report for contracts and executed evidence.

## Monitoring and data flow

React/TypeScript/MUI requests stored mentions from FastAPI through the Vite development proxy. SQLite stores input plus validated serialized analysis. React calculates actual global counts, UTC active-day history and topics, then applies list-only search/filters/sorting. No social-platform collection or fabricated KPI is implied.

Manual creation and import share fictional-only validation. Required brand/content/platform text is trimmed and cannot be blank, NUL-containing or malformed Unicode. Publication dates require an explicit timezone and normalize to UTC. Invalid input returns 422 before analysis or writes. Existing stored rows are preserved; write validation is deliberately separate from legacy reading.

## JSON round trip

Download JSON, then upload the unchanged nonempty file within the 1–500-record and 1 MB UI limits. It includes stored IDs and nested analysis for inspection. Import explicitly discards those fields, validates the remaining inputs and uses the application's selected analysis pipeline. The database allocates fresh identities; import appends duplicates and never updates existing records. It is not a faithful backup/analysis restore. Unknown non-metadata fields are rejected and invalid batches insert nothing.

CSV is export-only, flattens metadata and mitigates spreadsheet formula triggers. Seed only populates an empty database; the separately confirmed reset replaces all fictional rows, including manually authored ones, and refuses non-sample legacy records.

## Actual inference and fallback

Default `AI_PROVIDER=deterministic` uses English keyword rules. `gemini` selects the backend-only REST adapter. JSON parsing/Pydantic validation precede persistence; backend code assigns method/model. Timeout, transport, HTTP and invalid-response/configuration failures produce labeled rule fallback. The 45-second setting is per HTTPX phase, not a total request deadline. There are no automatic retries.

The journal records one controlled successful service request on 2026-10-14: HTTP 200, 6.86 seconds, validated `method=llm` and `gemini-3.1-flash-lite`. Earlier 404/timeout attempts and an incorrectly isolated early pytest run are historical failures, not the current implementation status. This success is one positive example, not classifier accuracy, current availability, quota assurance or a live browser test. No new generation request was made during the audit/P1 fixes.

The deterministic evaluator has ten illustrative labels: relevance 100%, sentiment 70%, action-required 90%, all three fields correct in 70% of cases at the audit. Negation, German and sarcasm expose limitations. Topic/priority/summary quality is not measured by that score. Schema validation is not proof of truth or prompt-injection resistance.

## UI and development explanation

Demonstrate overview → attention queue → detail → suggested action → provenance. DE/EN switching preserves filters, drafts and disclosure; only language survives reload. Original content/analysis remains unchanged. The main view selects saved bilingual model wording or clearly labeled local legacy/rule classification descriptions. Old free-text nuance is preserved only in the original disclosure, not automatically translated. Language switching sends no API request and performs no analysis. MD3-inspired MUI surfaces and keyboard/axe checks are not a conformance certification.

Explain why SQLite and client aggregation fit a small local demo and where migrations, pagination, queues, rate/body limits and authentication would be needed. They are outside this fix scope. Distinguish AI-assisted development, actual runtime inference and deterministic rules; use actual journal decisions and mistakes.

## Verification and presentation boundary

See [analysis-language QA](../testing/ANALYSIS_LANGUAGE_QA.md) for current local results and the bilingual/derived text distinction; [P1 verification](../testing/P1_FIX_VERIFICATION.md) preserves the earlier contract-hardening record. Automated tests use temporary SQLite, deterministic AI and blocked unintended application traffic. Registry audit traffic is separate. Older CI success covers committed HEAD only; current changes remain local. Owner acceptance precedes the final PPTX/PDF/German notes and timed rehearsal.
