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

## 2026-10-14 — Free-tier Gemini configuration confirmed by product owner
- Product owner selected existing Gemini AI Studio free-tier project/key and approved using it without enabling billing.
- Added local dotenv loading in the backend, a configuration example and Windows local setup instructions.
- Real API key remains with the product owner, never in Git; there has been no credential-backed live verification.
- Free-tier limits, privacy conditions, costs and user setup are documented transparently. The next acceptance check needs the user to configure their key locally and inspect method provenance.


## 2026-10-14 — Live Gemini discovery and unresolved model access
- Two initial credential-backed `gemini-2.5-flash` generation requests (fictional positive and negative mentions) returned HTTP 404 / `NOT_FOUND`. Both used the existing deterministic fallback; no live `method=llm` result was obtained.
- One authenticated request to the official `GET /v1beta/models` endpoint succeeded (HTTP 200); the complete response listed 63 models, 46 supporting `generateContent`, with no next page. `gemini-2.5-flash` itself is listed with `generateContent`, so absence from discovery is not the established cause of the earlier 404. Discovery does not prove inference entitlement or quota.
- Discovered lightweight text candidates include `gemini-2.5-flash-lite`, `gemini-3.1-flash-lite`, `gemini-3.5-flash-lite` and the moving `gemini-flash-lite-latest` alias. Prefer a versioned model rather than a moving alias; provisional candidate is `gemini-3.1-flash-lite`, pending actual project quota verification.
- Google's current pricing/model documentation reports free-tier text input/output and structured-output support for `gemini-3.1-flash-lite`. Model availability, account tier and project-specific remaining quota are distinct checks.
- AI Studio's project rate-limit page requires Google sign-in in the accessible browser. Actual RPM/TPM/RPD and current project tier are not yet verified; no additional generation request or local model change has been made.
- Four existing adapter tests passed; valid JSON provenance and invalid-output fallback are verified with mocks only. A simulated connection failure also returned deterministic fallback without an API request.
- Key was loaded only locally and transmitted in a header only to the official Gemini endpoint; no billing, production, merge, push or deployment changes. For an interview, show fallback honestly; do not present these results as successful real model inference.
- References: https://ai.google.dev/gemini-api/docs/pricing ; https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-lite ; https://ai.google.dev/gemini-api/docs/rate-limits .


## 2026-10-14 — Flash-Lite verification attempt and test-isolation correction
- Product owner confirmed Google's Free Tier and `gemini-3.1-flash-lite` limits: 15 RPM, 250,000 input TPM, 500 RPD. The exact model identifier and `generateContent` support were confirmed by the prior authenticated Models API listing.
- Updated only the ignored local `.env` model setting to `gemini-3.1-flash-lite`, preserving the existing key. No billing/account changes. Versioned Flash-Lite was chosen for lightweight structured classification and confirmed free-tier eligibility; the moving latest alias was avoided.
- One deliberately instrumented generation request through the unchanged application adapter used a fictional positive Aurora headphones mention. It failed with `httpx.ReadTimeout` under the existing 12-second timeout. No HTTP status or provider body was received; JSON/Pydantic validation of a live response and `method=llm` remain unverified. The application returned labeled deterministic fallback, positive sentiment, low priority and null model name.
- Agent error: the initial full pytest invocation inherited the live Gemini `.env` instead of forcing offline mode. That run showed a failure and was stopped; it could have initiated additional generation requests. The overall exactly-one-request restriction cannot be certified, despite one controlled request in the explicit integration probe. No retries or further deliberate live requests were made.
- Corrected local test invocation using process-only `AI_PROVIDER=deterministic`: 23 passed, 1 Starlette/httpx deprecation warning in 0.83s. `pip check`: no broken requirements. No source-code changes were made.
- Demonstration status: deterministic/fallback demo works; real model inference is not verified. Timeout does not establish a model-access, key, billing or quota failure. A request may have been processed remotely even when the client timed out; check AI Studio usage. Any timeout adjustment or new live test needs separate scope and a new request allowance.


## 2026-10-14 — Configurable timeout and offline pytest safety
- Problem: the controlled Flash-Lite request raised ReadTimeout under the adapter's fixed 12-second HTTPX timeout. No status/body arrived, so provider latency, network stall and remote completion cannot be distinguished. No new live requests were made to investigate.
- Chose `AI_TIMEOUT_SECONDS` with a 45-second default and finite positive validation over a fixed larger value or retries. HTTPX applies this budget per connect/read/write/pool phase; it is not a strict total wall-clock deadline. Longer waits may delay synchronous request handling; retries remain disabled to avoid duplicate quota consumption.
- Disabled dotenv loading when `PYTHON_DOTENV_DISABLED=1`. Pytest conftest sets that flag, deterministic provider and an empty credential before importing test modules, regardless of inherited environment. Session guards reject HTTPX real transports and socket connections during collection and execution. MockTransport and in-process ASGI tests remain supported.
- Initial blanket socket guard broke Windows asyncio's internal loopback socketpair. Corrected with a thread-local exception confined to socketpair construction; ordinary loopback and external connect attempts remain rejected. This test policy is a regression guard, not an OS sandbox for arbitrary subprocesses or third-party native networking.
- Added regression tests: ordinary child pytest with hostile inherited Gemini settings, HTTP/socket blocking, timeout defaults/override/invalid values, simulated timeout/HTTP 429/transport failures, malformed JSON, missing candidates, invalid schema and non-object output; assertions verify single mock attempt, labeled fallback and secret-free logs.
- Failure logging records only a safe category and HTTP status, never exception messages, response bodies or headers. Successful response schema and provenance remain unchanged; redirects remain disabled.
- Verification: full backend suite 39 passed, one existing Starlette/httpx deprecation warning. No external requests occurred; Windows internal loopback socketpair IPC is allowed. No live Gemini call, billing, push, merge or deployment.
- Demonstration: explain that offline tests prove validation and fallback, not successful real inference. The 45-second setting prepares the adapter for a separately authorized controlled live test.


## Controlled live Gemini verification — 2026-10-14
- Configuration verified: `AI_PROVIDER=gemini`, `AI_MODEL=gemini-3.1-flash-lite`, `AI_TIMEOUT_SECONDS=45`. Added the explicit timeout to ignored local `.env` where previously only the application default applied; the key was preserved and never printed.
- Exactly one real generation request used the existing unchanged application adapter and a fictional Aurora headphones mention. No retry, additional discovery or other live generation request. HTTP 200 in 6.86 seconds; TCP and TLS completed, finish reason STOP.
- Provider JSON object parsed successfully and validated through MentionAnalysis/Pydantic. Application provenance: `method=llm`, `model_name=gemini-3.1-flash-lite`. Classification: relevant=true, sentiment=positive, topic=product feedback, action_required=false, priority=low, suggested_action=null. Summary: Customer expressed high satisfaction with Aurora headphones.
- Usage reported: 175 prompt tokens, 92 response tokens, 267 total tokens. Free Tier and project limits (15 RPM, 250,000 TPM, 500 RPD) were confirmed by the owner; no billing/account changes. The response's standard service tier is not independent proof of billing tier.
- Ordinary offline pytest with session network guards: 39 passed, one existing Starlette/httpx deprecation warning in 2.50s. pip check passed. No external network requests during tests; Windows internal socketpair IPC remains allowed.
- Real inference is now verified at the application-service boundary. Ready for a small controlled optional LLM demo with deterministic fallback retained. This is one positive sample, not classifier-quality evidence, a negative live test, throughput proof or end-to-end browser QA. Earlier 404 and 12-second timeout causes remain unresolved; this success does not prove the timeout change caused success.
- API key sent only to the configured Gemini endpoint in a header. No source changes, pushes, merges or deployment in this verification.


## 2026-10-14 — Isolated browser E2E and MVP QA
- Added Playwright 1.64.1 and Chromium, desktop/mobile projects, an npm lockfile and separate Vitest discovery. A test-only backend wrapper provides a temporary SQLite DB, deterministic AI, no dotenv/credentials and external HTTP/socket blocking; browser routing restricts HTTP/WebSocket traffic to the test origin. No production test-reset endpoint was added.
- Eight browser cases passed in 18.9s, covering stored metrics, combined filters, analysis details, form creation, JSON import and actual JSON/CSV downloads, loading, errors/retry and empty states. Checked 1440/390 viewports plus 320/768 overflow; inspected desktop/mobile screenshots.
- Fixed dashboard refresh unmounting forms and losing success messages, misleading empty metrics after initial load failure, and missing explicit sentiment/priority in details. Harness corrections: Windows command quoting, scoped alert selectors, Node types and excluding E2E specs from Vitest.
- Backend: 39 passed (one existing deprecation warning), dependency check clean. Frontend: 8 unit tests passed and TypeScript/Vite build passed. npm still reports 6 advisories; no breaking upgrade applied.
- No live Gemini requests, credentials displayed, billing changes, pushes, merges or deployments. Existing local Gemini configuration and user database were preserved. Dependencies/browser installation used standard registry/vendor downloads.
- Deterministic browser demo is ready within the tested scope; live Gemini UI, other browser engines, accessibility/security audits and large/concurrent workflows remain pending. See docs/testing/BROWSER_E2E_RESULTS.md and ADR 0009.


## 2026-10-14 — npm advisory remediation
- Audited the full installed graph (6 findings: 3 moderate, 1 high, 2 critical) and production-only dependencies (0 findings). All affected chains belonged to development tooling, with file-disclosure/code-execution risks described in docs/testing/DEPENDENCY_SECURITY_AUDIT.md.
- Final direct changes: Vite 5.4.21 -> 6.4.4 and Vitest 2.1.9 -> 4.1.11. Regenerated the lockfile without force or overrides; esbuild now 0.25.12, mocker 4.1.11, old tinypool/vite-node chains removed. React, MUI, TypeScript, React plugin and Playwright unchanged.
- Initially validated Vite 7 but selected the patched Vite 6 branch after registry review to reduce migration scope. Vitest 4 was necessary for the patched mocker line; staying on older majors or overriding transitive majors was rejected.
- Final results: 39 backend tests, 8 frontend tests, production build and 8 desktop/mobile E2E cases all passed; full and production npm audits both 0. E2E took 20.0s. No live Gemini, credentials exposed, billing changes, push, merge or deployment.
- Ready for local UI/UX work, with broader accessibility/security/browser/CI verification still pending. Zero audit findings is not a security certification.


## 2026-10-14 - Triage-first UI/UX refinement
- Reviewed the monolithic functional dashboard, prior ADRs, roadmap and presentation evidence. Observed low hierarchy, forms preceding review work, absent navigation, weak visualizations and technical detail overload.
- Implemented a restrained MD3-inspired light theme, desktop rail/mobile section navigation, KPIs, actual-count activity bars, sentiment proportions, ranked topics, action queue and visible filter state. Data tools and technical provenance use disclosure. Detail rows label tone, urgency, fictional data and analysis origin separately.
- Kept React/MUI/API contracts, split visualizations/details into modular components, added no runtime dependency. Added development-only axe-core for regression checks. Corrected UTC activity/filter/sort behavior and added unit coverage.
- Initial redesign run exposed an accordion interaction race; removed unnecessary transition movement and added form-validity assertions. Final workflow tests pass. Keyboard skip/focus/disclosure tests and desktop/mobile axe checks pass.
- Results: backend 39, frontend 10, browser 12 tests passed; production build and pip check passed; npm audit 0. Desktop/mobile plus 320/768 overflow checks passed. Before/after screenshots recorded from isolated fictional data.
- No live Gemini request, key exposure, billing change, push, merge or deployment. Existing working-tree changes were preserved. Screen reader/zoom/other engines/real devices/dark mode/large datasets/final CI remain pending. See ADR 0010 and docs/testing/UI_UX_QA.md.


## 2026-10-14 - Portfolio README and complete DE/EN interface
- Replaced the starter README's planned/obsolete descriptions with actual implementation, Mermaid architecture, setup/configuration, security and evidence-based limitations. Added verified bilingual desktop/mobile screenshots with relative paths.
- Selected bundled i18next/react-i18next catalogs over bespoke plural logic or external translation services. Browser detection, preference persistence, document language and accessible header toggle are implemented without remounting workflows. Original content and stored analysis remain unchanged.
- Localized app-controlled labels, enum descriptions, accessibility/status/help text, forms/native validation, transfer success/errors, dates and numbers. Error objects/counts are localized at render, preserving meaning while switching. The untouched manual-entry default is localized separately from authored source text.
- Tests caught switch contrast and encoding-sensitive validation lookup; fixed colors and typed error keys. Added catalog/interpolation parity, locale/error tests plus bilingual detection/persistence/state/storage/native-validation/axe/viewport coverage.
- Results: 39 backend, 14 frontend, 22 browser tests passed; build/pip check passed; npm audit 0. Only deterministic isolated data used. No live Gemini, translation service, billing, secrets, pushes, merges or deployment.
- ADR 0011 and LOCALIZATION_QA.md document trade-offs, native browser chrome, English-only rules, unverified broader accessibility/devices and presentation boundaries. Existing unrelated working-tree changes were preserved.


## 2026-10-20 — P1 contracts before personal acceptance
- Owner authorized the four audit fixes, offline regression verification and documentation reconciliation; no new features, live generation, remote publication or personal-data deletion.
- Chose a dedicated import model discarding only ID/analysis metadata, preserving inspectable exports and recomputing analysis. Imports append with database identities rather than trusting exported ones. Full batch validation/analysis precedes transactional insertion.
- Split write validation from stored reads so legacy rows remain readable and protected by reset refusal. Shared writes require fictional booleans, normalized nonblank valid text and explicitly aware timestamps normalized to UTC. Errors avoid echoing raw content, including malformed Unicode.
- Global pytest database isolation now protects tests that omit module-specific fixtures. The legacy reset test seeds its temporary database directly instead of invoking prohibited non-sample API creation.
- Added backend contract and downloaded-file/cross-timezone browser regressions. First backend run: 110 passed. Initial browser run: 23 passed / 5 failed due to a new test's wrong chart label and an assumption that SQLite IDs restart after DELETE. Corrected test selectors/identity assertions; no product styling change was needed. Final executed evidence is recorded in docs/testing/P1_FIX_VERIFICATION.md.
- Reconciled current README/roadmap/changelog/architecture/provider/transfer/demo/presentation explanations; preserved dated historical journal/QA/audit evidence and clearly linked current outcomes. ADR 0012 records alternatives, decision, safety and limits.
- DE/EN interface/design and existing user data/configuration preserved. No live Gemini, paid services, secrets displayed, pushes, merges or deployment. Product-owner manual acceptance and final presentation remain pending.


## 2026-10-20 — Analysis-language consistency without repeat inference
- Owner requested summaries/explanations/recommendations to follow DE/EN, original/classification/provenance preserved and no model call on switching.
- Evaluated fully neutral templates, saved language pairs and on-demand/backfilled translation. Selected optional saved bilingual model text from the original generation, plus explicitly labeled local descriptions for legacy/rule classifications. Arbitrary old free text is not faithfully translated; its unchanged original remains inspectable. ADR 0013 records this limitation and cost trade-off.
- Added validated de/en text schema inside existing serialized analysis JSON, revised prompt and 1600-token output ceiling; no new translation service, dependency, request-on-switch or data migration. Language selection is a pure frontend helper. Rules/known recommendations and historical fallback notices are localized through bundled catalogs.
- Backend initial run: 120 passed / 2 failed. Existing CSV tests detected the optional nested field leaking into a flat DictWriter; excluded it from CSV while retaining original columns and full JSON metadata. After correction: 122 passed; pip check clean.
- Frontend/browser tests cover saved versus derived wording, unchanged originals/classification/model metadata and no API requests after load on switches. Live bilingual provider quality remains unverified; final executed results are in docs/testing/ANALYSIS_LANGUAGE_QA.md.
- Final frontend verification: 18 Vitest tests passed; production build passed (502.21 kB minified / 157.27 kB gzip; chunk-size warning remains). The first full browser run was 33 passed / 1 failed while a concurrent locale edit caused a second document load and lost state. After freezing source edits, the complete repeat passed all 34 cases in 1.0m. No assertions were weakened. Backend remains 122 passed with one existing deprecation warning.
- Updated current README/roadmap/changelog/architecture/ADRs, testing and presentation guidance, keeping old records clearly historical. No live Gemini, secrets, paid translation service, personal database writes, push/merge/deployment or application-service restart was performed.

## 2026-10-20 — GitHub synchronization and release preparation
- Owner authorized committing/pushing the complete MVP to the existing feature branch and updating PR #1, explicitly reserving the main merge. Preserved the branch/history and all development work; no force-push/history rewrite, merge, tag or deployment.
- Inspected origin/main/feature refs, dirty/untracked files, existing PR description and prior evidence. Added portable Playwright Python selection, npm ci and dedicated Linux E2E/release-hygiene CI jobs with read-only permissions; no runtime product feature added.
- Hardened ignore rules for database sidecars, local package/build metadata and temporary logs. Added bounded dependency-free signature/history/file/link/fixture/lock checks without printing matched values. Initial scan found workstation paths in two documentation files; replaced them with public portable examples. Existing .env and all databases remain ignored/untouched. Normalized a legacy mixed-encoding dash in setup documentation to UTF-8.
- Fresh local verification: backend 122 passed (1 warning, 4.82s), pip check clean; frontend 18 passed (514ms), build passed (3.25s, existing chunk-size warning), Chromium E2E 34 passed (60.0s); full and runtime npm audit 0; signature/hygiene self-test and precommit history scan passed. Refreshed six screenshots from the isolated suite, retaining before/after history assets.
- Reconciled current publication/setup statements while clearly retaining historical audit/QA results. Added ADR 0014, a release preparation report, proposed v0.1.0 notes, branch-protection recommendations and reproducible offline-demo guidance. No personal acceptance, final deck or live bilingual model-quality result was invented. Final remote SHAs/check results must be reported after push rather than inferred from these local results.
