# P1 Fix Verification Before Personal Acceptance

> Historical audit/QA snapshot. Publication state and current release validation are recorded in `docs/releases/RELEASE_PREPARATION.md`; uncommitted/local-only statements below describe this earlier milestone. Original evidence is preserved.

Date: **2026-10-20 (Europe/Berlin)**. Branch: `feat/project-foundation`. All results below are local; no commits, push, merge or deployment were performed. Existing uncommitted work was preserved. The original audit remains a historical snapshot with a follow-up notice.

## Later analysis-language update
This is the P1 milestone record. Latest results and the revised analysis display contract: [ANALYSIS_LANGUAGE_QA.md](ANALYSIS_LANGUAGE_QA.md), ADR 0013. Earlier test counts and unchanged-JS statement below apply to this P1 snapshot only.

## Outcome

**Audit findings F1–F4 are fixed within the existing MVP input/transfer limits. The application is ready for manual product-owner acceptance on dedicated fictional data.** This is not final interview approval or production certification. The DE/EN interface and design are unchanged; the frontend production JS hash/size remained the same.

## Implemented fixes

| Finding | Implementation and regression evidence |
|---|---|
| F1: export/import mismatch | Full JSON exports remain inspectable. `MentionImport` discards only `id` and nested `analysis`, then applies normal input validation. The server recomputes analysis through the existing selected-provider pipeline and the DB allocates insert IDs. Backend unchanged round trip and forged-metadata tests pass; browser tests upload an actual downloaded JSON file unchanged on desktop/mobile. |
| F2: sample-only policy bypass | Shared `MentionCreate` validation rejects false and non-boolean sample flags with 422 for both endpoints, without relabeling. Omitted flags retain the existing true default. Legacy read models remain separate so older rows stay readable/protected; reset refusal is tested through direct insertion into temporary storage rather than prohibited API creation. |
| F3: whitespace/type/malformed text | Required brand/content/platform trim before constraints; empty/Unicode-whitespace-only, non-string, NUL and malformed Unicode values return 422 before analysis. Interior newlines/Unicode are preserved. Error responses provide location/type/message without echoing input or exception context; ASCII JSON safely reports malformed Unicode. Malformed JSON also returns 422. |
| F4: timezone-free publication dates | New ISO timestamps require an explicit timezone and normalize to UTC before storage. Numeric epochs, date-only/naive dates, malformed values and UTC-range overflow return 422. Tests inspect actual SQLite UTC strings and API timestamps. Browser regressions exercise activity, date filters and chronological sorting in Berlin/Los Angeles contexts on desktop/mobile. |

`MentionFields` describes stored reads; `MentionCreate` adds write validation; `MentionImport` adds explicit metadata discard. This avoids applying new input policy retroactively to existing rows. Unknown fields beyond permitted export metadata remain forbidden. All batch input validation completes before analysis; all analysis completes before one transactional insertion. Invalid batches preserve existing records and never partially insert valid preceding rows. See ADR 0012 for alternatives and trade-offs.

## Executed verification

| Check | Command | Actual result |
|---|---|---|
| Backend, final source | `.\.venv\Scripts\python.exe -m pytest -q` from backend | **114 passed, 1 warning in 4.56s** |
| Python consistency | `.\.venv\Scripts\python.exe -m pip check` from backend (equivalent root path also used) | **No broken requirements found.** |
| Frontend unit tests | `npm test` | **14 passed, 4 files, 528 ms** |
| Production build | `npm run build` | **Passed**; 961 modules; 2.64s; main JS `index-CtrFjk3j.js`, 497.30 kB / 155.62 kB gzip |
| Targeted new browser regressions | `npm run test:e2e -- e2e/input-contract.spec.ts` | **6 passed in 11.9s** |
| Full browser suite after harness corrections | `npm run test:e2e` | **28 passed in 49.7s**, one worker, zero retries; desktop/mobile Chromium |
| Full npm audit | `npm audit --json` | **0 vulnerabilities** in every severity category; metadata total 218 dependencies |
| Runtime npm audit | `npm audit --omit=dev --json` | **0 vulnerabilities** |
| Patch whitespace | `git diff --check` | Passed; existing LF/CRLF conversion notices only |

Backend full execution includes **75 new contract cases plus 39 pre-existing tests**. The final four added cases reject UTC conversion overflow; positive browser flows are unchanged. Vitest's existing UTC-offset filtering/sorting/activity tests passed; new cross-timezone coverage is at browser/API level. Existing DE/EN persistence/state/errors, keyboard, responsive-width and axe assertions remain green in the full suite.

The known Starlette/HTTPX deprecation warning remains. Playwright emits an environment `NO_COLOR`/`FORCE_COLOR` warning; neither causes a test failure. No vulnerability scan of backend packages was performed; `pip check` is not a security audit.

### Initial failure and correction record

The initial expanded browser run produced **23 passed / 5 failed**. Four new date checks looked for “Daily mention counts” instead of the existing “Daily mention activity” accessibility label. The mobile round-trip assertion assumed IDs start at 1 after the wrapper's DELETE, but SQLite's autoincrement sequence intentionally continues. Corrected the test selector and asserted unique new IDs relative to the original record. The targeted six cases and subsequent full 28-case run passed. No product styling or ID-reset behavior was changed to satisfy the tests.

### Isolation and safety

Pytest disables dotenv, clears the provider key, forces deterministic mode and blocks real HTTPX/socket traffic before test imports. A new global autouse fixture supplies a temporary SQLite path even to tests without module-specific fixtures. Existing provider tests use fake clients/MockTransport; the inherited-Gemini child-pytest safety regression passed.

Playwright uses dedicated loopback servers, refuses reuse, allocates temporary SQLite and forces deterministic analysis without dotenv/credentials. Browser HTTP/WebSocket guards and backend outbound guards remain active. The test-only reset clears only that temporary database; no reset was run on personal data. Package audit registry traffic is intentional and separate from application requests. No live Gemini, paid services, secrets displayed, `.env` edits or unrelated-repository modifications occurred. These guards are test policy, not an OS firewall.

## Documentation reconciliation

- README: input/transfer/timezone contract, append/reanalysis semantics, local-only setup caveat and current results.
- ROADMAP/CHANGELOG: four fixes, scoped audit completion, current verification, owner acceptance and final-presentation work still pending; live connectors/Ollama remain outside final MVP.
- Architecture and technical walkthrough: actual implemented pipeline/API inventory, separate input/read models, legacy-data handling, selected-provider imports, timeout semantics and current limitations; removed shell/planned-analysis claims.
- ADR 0012: alternatives, metadata trust, fictional/text/UTC validation, limits and demonstration rationale. ADRs 0002/0004/0006/0008 clarify historical scope and subsequent outcomes.
- Development journal: actual owner request, decisions, implementation, test-harness mistakes and corrections; earlier historical provider/test-isolation records retained.
- Test strategy and older QA reports: obvious link to current evidence; historical counts/advisories labeled as milestone results. Classification docs acknowledge the already-existing ten-case dataset and its limited score meaning.
- Demo script: dedicated acceptance database, process-only offline settings, eight-minute workflow, unchanged downloaded-file reimport, fallback and destructive-reset boundaries.
- Slide outline, overview, AI-process notes, future-work notes and interview Q&A: current scope, actual service evidence vs offline/mocked coverage, validation vs truth, fresh IDs, UTC, local/CI distinction and 30-minute timing. No final deck was created.
- Final audit: preserved pre-fix findings with a dated pointer to this outcome; no historical test results relabeled as current.

## Remaining issues and limits

- Manual owner acceptance, restart persistence, real-device/zoom/screen-reader review, final presentation/rehearsal and confirmation of the original assignment are pending.
- Current work remains local/uncommitted. Historical green CI does not cover it; no publication was requested or performed.
- Import is append-only, not deduplication/upsert/backup restoration. Existing constraints remain **1–500 records** and **1 MB browser file limit**. Empty or larger exports cannot be reimported as one batch. Legacy non-sample or timezone-free exported records are rejected until explicitly corrected; existing database records themselves are not altered.
- A true/default sample flag cannot prove factual authenticity; use fictional text only. Legacy non-sample rows remain readable and continue to prevent destructive reset. Newly written rows use UTC; old naive/offset rows are not migrated or silently guessed.
- Audit F5 reserved-topic-name aggregation remains P2 and unchanged. Global KPIs/list-filter semantics, active-day chart gaps and larger-data behavior also remain acceptance/optional quality items.
- English-only rule quality, semantic/model coercion/injection limits and lack of real-provider browser/multilingual verification remain. Historical successful Gemini service evidence is not newly repeated.
- No server request-byte ceiling, authentication, rate limits/provider budgets, background inference queue or production hardening. Gemini-enabled imports can issue sequential real calls; personal offline acceptance should retain deterministic mode.

## Personal acceptance recommendation

Use the updated demo script and the audit checklist, applying the corrected outcomes: unchanged supported JSON exports should reimport; prohibited sample/text/date input should return 422 without writes. Select a dedicated new database and leave the existing personal/demo database untouched. Confirm the DE/EN workflow, filters/sorting, real persisted counts, fresh IDs/analysis, reload/restart persistence and clear failure/retry behavior. Record defects or explicit acceptance before preparing the final PPTX/PDF/German speaker notes. The requested implementation fixes are verified locally; human product acceptance remains the next step.
