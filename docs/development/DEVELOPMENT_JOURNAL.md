# Development Journal

## 2026-10-14 — Project baseline

### Context
The repository was empty. The project instructions defined the ATZ assignment, preferred architecture, workflow and documentation requirements.

### Human decisions already established
- Product name: AI Brand Monitor
- Representative sample data is sufficient
- Live platform integrations are optional bonus work
- Material Design 3 principles should guide the interface
- Stability and explainability take priority over feature count

### AI-assisted work performed
- Established repository governance and baseline documentation
- Converted assignment requirements into measurable acceptance criteria
- Created the first architecture decision record
- Started the application foundation

### Notes
No external AI provider has been selected yet. No claim is made that an LLM is currently integrated.

## 2026-10-14 — Presentation and decision-traceability requirement

### Human instruction
The final interview deliverables must include a PowerPoint presentation explaining how the MVP was built, why technologies and approaches were selected, how AI was used, what trade-offs were accepted, and then a separate demonstration of the functioning MVP. Prefer a detailed first draft; refine the presentation collaboratively at the end.

### Documentation change
Expanded AGENTS.md Definition of Done and explanation requirements, added the .pptx/PDF/speaker-note deliverables to the roadmap and presentation guide, and established a slide-deck plan.

### Status
Planning and documentation only. No .pptx has been produced yet; no presentation or demo has been performed.

## 2026-10-14 — CI investigation and Phase 1 data foundation

### Actual CI observation
GitHub Actions run 38552078389: backend job succeeded including pytest; frontend failed during TypeScript build with TS5096. The node TypeScript configuration enabled allowImportingTsExtensions without noEmit/emitDeclarationOnly. Fixed by using noEmit and dropping the unnecessary option. The same run reported six npm audit advisories (three moderate, one high, two critical), requiring an audit and dependency review before release. Do not call this a passed run.

### Implementation
- Added Pydantic mention and analysis contracts with explicit validation and enumerations.
- Added SQLite schema and service for create/list/get operations.
- Added API routes and isolated database tests.
- Added a representative fictional demo dataset and an idempotent non-destructive seed script.
- Kept the analysis field optional until actual deterministic/LLM analysis is implemented, so no fake inference is presented.

### Rationale
Built-in SQLite reduces operational complexity and is adequate for a small demonstration. A JSON-serialized analysis payload is a temporary MVP choice; richer search/filtering may justify normalized fields or a migration later. This trade-off is documented in the next ADR.

### Verification
Implementation committed to the feature branch; CI must be rerun and checked. No test pass is claimed for these new changes yet.

## 2026-10-14 — Follow-up CI debugging

### Observed
Latest completed CI run 38553101488: frontend job passed (including build and Vitest), backend installation failed before pytest. Setuptools reported multiple top-level packages discovered in flat layout: `app` and `data`.

### Fix
Added explicit setuptools package discovery in `backend/pyproject.toml` to package only `app*`, excluding data, scripts and tests. This prevents sample data from being interpreted as Python application code.

### Verification
A fresh CI result is still required. Do not mark the backend test suite as passed on this commit until CI completes.

## 2026-10-14 — First deterministic analysis baseline

Implemented an English-only keyword-based service to classify relevance, sentiment, topic, urgency and priority, with explicit `method=deterministic`. New mentions submitted via POST are annotated, and the fictional seed data is classified using the same service. Added isolated tests for positive, negative support, unrelated, mixed and question cases.

This is intentionally not presented as an LLM. The limited heuristics can fail on negations, sarcasm and ambiguous contexts; see ADR 0003. This work remains subject to latest CI verification.

## 2026-10-14 — Data-driven monitoring UI
- Introduced frontend API contract and Vite dev proxy.
- Added derived metrics with Vitest coverage: total mentions, sentiment distribution, attention count, topic counts and daily activity data.
- Added responsive dashboard cards, combined search/sentiment/platform/attention filters, expandable analysis details, source-link behavior, loading, retry and empty states.
- Every number comes from the fetched dataset; fictional example records are labeled.
- ADR 0004 records the decision to start with client-side aggregation and its scalability trade-off.
- Final CI and manual browser visual verification remain required. The daily-activity series is calculated but not yet visualized.

## 2026-10-14 — Combined filters, activity and creation flow
- Added reusable pure `filterMentions` with topic, priority, date range, sentiment, platform, action status, case-insensitive search and sorting. Vitest scenarios cover combined conditions, inclusive dates, and sort stability.
- Added a data-derived daily activity display and manual sample-mention form backed by POST /api/mentions.
- New fictional mentions use the real backend validation, SQLite storage and transparent deterministic analysis; the UI refreshes after creation.
- All functionality remains on PR #1 without merge/deployment. ADR 0005 explains the lightweight design and trade-offs.
- Latest CI head, visual QA and security audit need verification before claiming this milestone complete.

## 2026-10-14 — JSON import and JSON/CSV export
- Added POST /api/mentions/import using Pydantic validation and transactional SQLite insertion; only fictional sample records are permitted.
- Added GET /api/mentions/export?format=json|csv returning stored records and analysis metadata.
- Added upload and download controls to the React interface and import/export API tests.
- Hardened CSV export against basic spreadsheet formula injection and added a regression test.
- Decision rationale and limitations recorded in ADR 0006. Browser-level visual validation and a server-side request size ceiling are pending.
- No merge or deployment performed.

## 2026-10-14 — Reproducible demo reset
- Added `python -m scripts.reset_demo --confirm` for explicit resetting of fictional local dataset.
- The reset refuses any database containing a non-sample record and replaces fictional data transactionally.
- Tests cover reset repeatability and refusing destructive changes to non-sample data.
- ADR 0007 records the choice of a CLI command over an unauthenticated destructive HTTP endpoint.
- CI verification of the latest changes remains pending.

## 2026-10-14 — Optional real-LLM integration
- Added a Gemini REST adapter with a provider-selection entrypoint. The default mode stays deterministic.
- FastAPI creation and import flows now invoke the analysis entrypoint, which optionally makes a server-side external request.
- Added Pydantic validation, request timeout, model provenance set by the server, exception fallback and mocked integration tests.
- No API key has been configured or committed. A live model call has not been demonstrated or claimed.
- ADR 0008 records alternatives, financial/privacy trade-offs and verification gaps. CI must be checked for this commit.

## 2026-10-14 — Classification evaluation baseline
- Added 10 labeled fictional evaluation cases covering difficult situations including negation, German text, sarcasm and prompt-injection wording.
- Implemented an offline evaluator for deterministic relevance, sentiment and action-needed accuracy and a test verifying its coverage.
- Documented that this is a small illustrative dataset, not proof of production accuracy or evidence of live LLM performance.
- See docs/testing/CLASSIFICATION_EVALUATION.md for the protocol and limitations.
