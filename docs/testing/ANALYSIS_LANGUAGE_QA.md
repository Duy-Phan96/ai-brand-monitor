# Analysis Language Consistency — Verification

> Historical audit/QA snapshot. Publication state and current release validation are recorded in `docs/releases/RELEASE_PREPARATION.md`; uncommitted/local-only statements below describe this earlier milestone. Original evidence is preserved.

Date: **2026-10-20 (Europe/Berlin)**. Branch: `feat/project-foundation`. Local uncommitted work; no push, merge, deployment or application-service startup. Earlier P1 and interface-localization reports remain historical milestones.

## Behavior and implementation

The active DE/EN language now determines the main summary, explanation and suggested-action wording without making an API request. Original mention content, structured classification, method/model and stored original prose remain unchanged.

- **Saved model wording:** new Gemini prompts request German and English variants in the same JSON response under optional `localized_text.de/en`. Both are schema-validated and stored in the existing analysis JSON. The frontend selects the requested language locally.
- **Existing/rule analyses:** records without a saved pair render a localized description of stored classification fields, method/action status and general review guidance. Known deterministic support/question recommendations have matching DE/EN catalog descriptions. This is clearly labeled as **not a translation of arbitrary old free text**. Original scalar analysis remains accessible in a separate untranslated disclosure.
- **No backfill or inference-on-switch:** no new endpoint, translation service, dependency or database migration. Existing database rows are not rewritten. Pure UI selection does not recalculate relevance, sentiment, priority or action_required and does not alter provenance.

See ADR 0013 for alternatives, the legacy-data limitation and why this hybrid was selected. ADR 0011's original interface-only display boundary is superseded for analysis prose.

## Fresh executed checks

| Check | Command / scope | Result |
|---|---|---|
| Backend pytest | `.\.venv\Scripts\python.exe -m pytest -q` from backend | **122 passed, 1 warning in 5.43s** |
| Backend dependency consistency | `.\.venv\Scripts\python.exe -m pip check` | **No broken requirements found.** |
| Frontend Vitest | `npm test` | **18 passed, 5 files, 437 ms** |
| Production build | `npm run build` | **Passed**; 962 modules, 2.75s; JS 502.21 kB / 157.27 kB gzip |
| Playwright full suite | `npm run test:e2e`, desktop/mobile Chromium, one worker, zero retries | **34 passed (1.0m)** on the complete repeat with frozen sources |

Build warning: main JS now slightly exceeds Vite's 500 kB minified-chunk threshold. The build succeeds; no arbitrary threshold suppression or unrelated code splitting was introduced. The pre-existing Starlette/HTTPX deprecation and Playwright color-environment warnings remain. No dependency was added or changed; no new registry vulnerability audit was required/run for this change.

## What the tests prove

### Backend

Eight added tests cover:

- One **mocked** generation returns both variants, persisted with the original mention, independent classification and backend-assigned `method=llm`/model name. Repeated GETs in both Accept-Language settings produce identical stored data and **no additional provider requests**.
- JSON retains both variants; CSV still exports its established flat original-text columns. No imported analysis becomes authoritative; existing safe-reanalysis import tests still run.
- Supplied bilingual pairs reject missing languages, blank strings, extra fields and wrong types through Pydantic. The field itself remains optional for legacy compatibility; a provider that omits it gets derived display, not automatic regeneration.
- Legacy rule, LLM and human rows lacking the new field remain readable. Repeated API reads preserve original content/classification/model metadata and **byte-for-byte original stored analysis JSON**.

The eight new cases run alongside all 114 existing backend tests, including network/credential isolation and input/transfer/UTC regressions. The optional field introduces no schema-table migration.

### Frontend unit tests

Four added tests verify German/English rule descriptions and known recommendations, saved-language selection, honest legacy LLM/human labeling, no-action behavior, exact historical fallback recognition, unchanged input objects and no fetch during text selection. Catalog key/interpolation parity remains covered. The helper contains no request or persistence code.

### Browser tests

Six added cases (three scenarios in each desktop/mobile project) exercise rules, old monolingual LLM and saved bilingual model text. Model-specific UI responses are explicit mocked fixtures; the rule workflow uses the real isolated backend.

Each opens analysis/provenance and switches DE→EN→DE, verifying the summary/explanation/recommendation language, original mention string, unchanged priority/method/model labels, and original-analysis disclosure. A request listener records **zero `/api/` requests after initial load during switching**, a stronger condition than merely zero generation requests. API records before/after are equal. Existing DE/EN state/persistence, keyboard, overflow, axe, JSON-download/reimport and cross-timezone tests are included in the full suite.

No browser test represents a new live Gemini result.

## Failures found and corrections

The initial backend run had **120 passed / 2 failed**: adding optional nested text caused CSV DictWriter to reject an unexpected `localized_text` column. Corrected CSV serialization to exclude only that nested field, preserving original flat columns; JSON remains complete. Existing CSV/JSON tests plus the bilingual persistence/export regression passed in the subsequent 122-test run.

The first full browser run had **33 passed / 1 failed**. During it, the agent changed a locale file while Vite was serving tests. The mobile state-retention test lost its search value; its trace shows a second document request at 20:01:57.890 UTC after the initial load at 20:01:56.529 UTC. This is consistent with a development reload from concurrent source edits, not proof of a language-switch mutation. Source edits were frozen and the entire suite repeated: **34 passed (1.0m)**. No product behavior or assertions were weakened to hide the failure.

## Network and data isolation

Pytest disables dotenv before application import, clears inherited credentials, forces deterministic mode and blocks real HTTPX/socket transports; provider tests use fake credentials with MockTransport only. Every test defaults to temporary SQLite. Existing child-pytest isolation probes still run.

Playwright starts dedicated loopback servers, refuses reuse, disables provider credentials/dotenv and uses temporary SQLite. Backend outbound transport/socket guards and browser origin/WebSocket guards remain active; service workers are blocked. No user development, acceptance or personal database was opened for mutation or reset. No live Gemini requests, keys displayed, paid translation service, source publication or deployment occurred. These are test safeguards, not an operating-system network sandbox.

## Documentation updates

- ADR 0013 records the alternatives, hybrid choice, optional schema, metadata preservation, cost and fidelity limits. ADR 0011 links the superseding display decision.
- README, ROADMAP and CHANGELOG describe current behavior/results, including saved versus derived prose and unchanged source content.
- Architecture and technical walkthrough describe storage/presentation boundaries and unchanged JSON/CSV import trust rules.
- Development journal records the actual request, implementation, initial CSV regression and test verification.
- Testing strategy and earlier localization/P1 reports link to current evidence while retaining their historical results.
- Demo script, slide plan, AI-process notes and interview Q&A demonstrate DE/EN switching with no requests and explicitly distinguish local descriptions from original model reasoning. Final PPTX/PDF/owner acceptance remain pending.

## Limits and remaining manual acceptance

1. **Arbitrary old model prose is not faithfully translated.** Its localized main view summarizes classification fields and gives generic review guidance; it can lose nuance compared with the original recommendation. The original remains inspectable and is explicitly untranslated. No hidden inference or bulk backfill attempts to solve this.
2. Both language variants in new prompts require more output tokens. The output ceiling changed from **800 to 1600** per existing generation, not an extra request or retry. Actual bilingual provider token usage, latency, availability, compliance and translation fidelity were **not verified live**.
3. Schema validation establishes shape, length and field presence, not actual language/semantic equivalence or classifier accuracy. Missing pairs use the derived view; invalid supplied pairs enter the existing provider fallback. Prompt-injection/semantic consistency risks remain.
4. Rule classification remains English-only. German presentation is not a multilingual classifier. Free-form topic/platform values and optional original-evidence text may remain in their source language.
5. Human/manual acceptance, real-device/screen-reader/zoom testing, final approved-source CI and final presentation/rehearsal remain pending. Work is local and uncommitted; earlier green CI cannot certify it.

For owner acceptance, open an existing rule/legacy/model record, switch DE/EN with provenance open, inspect the source notice and original disclosure, and confirm that content/classification/method/model stay unchanged. A valid saved bilingual pair should select its specific prose; a legacy row should explicitly identify derived wording. No actual provider invocation is needed to verify either UI path.
