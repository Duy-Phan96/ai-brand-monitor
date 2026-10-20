# ADR 0012 — Safe fictional input and JSON round trips

Date: 2026-10-20.

## Problem and alternatives

The final audit reproduced four gaps: full exports could not be reimported, creation bypassed the fictional-only policy, whitespace passed length validation then failed analysis, and timezone-free timestamps changed meaning across browsers.

Removing metadata from exports would lose useful provenance evidence. Restoring exported IDs/analyses would trust untrusted metadata and create identity collisions. We retain full exports but explicitly discard their identity/analysis on import. Applying new write restrictions to all reads was rejected because it would make legacy rows unreadable.

## Decision and implementation

`MentionFields` describes stored/read fields; `MentionCreate` adds shared write constraints; `MentionImport` discards only `id` and `analysis` before the same validation. Other unknown fields remain prohibited. Import accepts full JSON exports or minimal fictional inputs under `mentions`.

Both write endpoints require a real JSON boolean for `is_sample` (default true when omitted), reject false without relabeling, trim brand/content/platform and reject blank, NUL or invalid Unicode text. Interior whitespace and valid Unicode are preserved. Validation errors return 422 with location/type/message, without echoing input or exception context; ASCII JSON safely represents malformed Unicode error locations.

Publication dates must be ISO 8601 strings with an explicit timezone, or aware datetime objects internally. Epoch numbers, numeric strings, naive datetimes and date-only values are rejected. Dates normalize to UTC before analysis/persistence. Existing rows are not migrated, deleted or relabeled. Legacy reads preserve their original metadata/time semantics; importing legacy data requires explicit timezone information.

Every imported row receives fresh `analyze_mention` output using the server-selected provider and a database-generated ID. Imported provenance never becomes authoritative. New IDs are insert identities, not a promise that numbers differ across independent databases. Imports append duplicates; they are not upserts, deduplication or faithful analysis restoration.

The entire batch validates before analysis; all analyses complete before transactional insertion. Existing limits remain: 1–500 records per import and 1 MB for browser uploads. Empty/oversized exports cannot be reimported as one accepted batch. Gemini-enabled imports can make sequential provider calls; acceptance/tests must force deterministic mode. This is not a database backup/migration feature.

## Verification and interview explanation

Backend regressions cover unchanged round trips, fresh IDs, forged metadata, invalid batches before analysis, preservation of existing data, Unicode/whitespace/types, sample flags and UTC storage. The legacy reset test inserts a pre-policy row directly into temporary storage without reopening the API. A global pytest fixture isolates every test's database; existing HTTP/socket guards remain active.

Browser regressions upload an actual downloaded JSON file and check UTC activity/filter/sort in Berlin and Los Angeles contexts on desktop/mobile Chromium. Existing DE/EN and design checks remain. Executed results are recorded in `docs/testing/P1_FIX_VERIFICATION.md` after verification.

Explain: export preserves evidence; import creates newly validated and analysed fictional records. Schema validation does not establish authenticity or classifier accuracy. No live inference is needed to demonstrate these fixes.
