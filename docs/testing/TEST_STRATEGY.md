# Test Strategy

## Release verification
See `docs/releases/RELEASE_PREPARATION.md` for the release candidate, fresh checks, CI responsibilities and publication boundary. CI now uses npm ci and runs isolated Chromium plus dependency-free release hygiene/history signature checks; older platform/count statements below are dated evidence.

## Current verification

PR #2 dependency follow-up (2026-10-28): clean `npm ci` with Vitest/@vitest/mocker 4.1.12; retain the existing tests and low audit threshold. See [DEPENDENCY_SECURITY_AUDIT.md](DEPENDENCY_SECURITY_AUDIT.md) for audit findings, compatible patch selection, exact regression results and CI verification boundary. Application behavior is unchanged.

Topic-label follow-up (2026-10-28): see [TOPIC_LOCALIZATION_QA.md](TOPIC_LOCALIZATION_QA.md) for shared-label unit tests and desktop/mobile coverage of statistics, options, selected filters and expanded details. Tests cover all predefined identifiers, exact unknown fallback, state retention and zero requests during switching.
See [ANALYSIS_LANGUAGE_QA.md](ANALYSIS_LANGUAGE_QA.md) for latest language-display results and [P1_FIX_VERIFICATION.md](P1_FIX_VERIFICATION.md) for earlier contract regressions. New checks verify single mocked bilingual generation, legacy JSON preservation, localized rules/legacy wording, saved selection and zero browser API requests on switching; original/classification/provenance remain unchanged. The dated execution records below are historical; earlier test counts, advisory statuses and packaging-pending statements do not describe the latest working tree. Committed HEAD CI success was verified in the final audit, not for the current local changes.

## Goals
Verify business rules, API contracts and the critical demonstration flow without overbuilding test infrastructure.

## Backend
Use pytest for:
- schema validation
- analysis rules and fallbacks
- API success/error cases
- persistence behavior

## Frontend
Use Vitest for:
- filtering and transformation logic
- component behavior where logic matters

## End-to-end
Use Playwright for the final critical flow:
1. open dashboard
2. filter mentions
3. open a detail view
4. verify analysis metadata
5. open or gracefully handle a source link

## Reporting rule
Only executed tests may be reported as passed.

## CI and packaging regression record (2026-10-14)
- Initial frontend TypeScript build failed with TS5096; adjusted node tsconfig to noEmit. A subsequent GitHub Actions frontend job passed.
- Backend editable installation failed after introducing a top-level data directory. Added an explicit setuptools package selection to prevent automatic detection of demo data as source package.
- The packaging fix requires confirmation in a new workflow run.
- The npm installation previously reported vulnerability advisories. Audit versions, affected packages and remediation before release rather than applying breaking upgrades blindly.


## Controlled live Gemini verification — 2026-10-14
- Configuration verified: `AI_PROVIDER=gemini`, `AI_MODEL=gemini-3.1-flash-lite`, `AI_TIMEOUT_SECONDS=45`. Added the explicit timeout to ignored local `.env` where previously only the application default applied; the key was preserved and never printed.
- Exactly one real generation request used the existing unchanged application adapter and a fictional Aurora headphones mention. No retry, additional discovery or other live generation request. HTTP 200 in 6.86 seconds; TCP and TLS completed, finish reason STOP.
- Provider JSON object parsed successfully and validated through MentionAnalysis/Pydantic. Application provenance: `method=llm`, `model_name=gemini-3.1-flash-lite`. Classification: relevant=true, sentiment=positive, topic=product feedback, action_required=false, priority=low, suggested_action=null. Summary: Customer expressed high satisfaction with Aurora headphones.
- Usage reported: 175 prompt tokens, 92 response tokens, 267 total tokens. Free Tier and project limits (15 RPM, 250,000 TPM, 500 RPD) were confirmed by the owner; no billing/account changes. The response's standard service tier is not independent proof of billing tier.
- Ordinary offline pytest with session network guards: 39 passed, one existing Starlette/httpx deprecation warning in 2.50s. pip check passed. No external network requests during tests; Windows internal socketpair IPC remains allowed.
- Real inference is now verified at the application-service boundary. Ready for a small controlled optional LLM demo with deterministic fallback retained. This is one positive sample, not classifier-quality evidence, a negative live test, throughput proof or end-to-end browser QA. Earlier 404 and 12-second timeout causes remain unresolved; this success does not prove the timeout change caused success.
- API key sent only to the configured Gemini endpoint in a header. No source changes, pushes, merges or deployment in this verification.


## Reproducible isolated browser suite
See [BROWSER_E2E_RESULTS.md](BROWSER_E2E_RESULTS.md) for commands, test isolation, fixes, evidence and limitations. `npm run test:e2e` starts dedicated frontend/backend processes with a temporary database and deterministic AI. Chromium desktop/mobile workflows cover metrics, combined filters, details, creation, import/export and loading/error/empty states; external application traffic is blocked. Latest result: 8 passed, zero retries. This does not replace separate live-provider or accessibility testing.


## Dependency audit follow-up - 2026-10-14
Supersedes the earlier unresolved npm advisory status: final Vite 6.4.4 and Vitest 4.1.11 reduce full/production npm audits to 0. 39 backend tests, 8 frontend tests, production build and 8 Chromium E2E cases passed; no live Gemini calls. Dependency rationale and residual limits: docs/testing/DEPENDENCY_SECURITY_AUDIT.md. Other browser/accessibility/security coverage and final CI remain pending.


## UI/UX regression evidence
The redesigned interface has 12 E2E cases including attention triage, keyboard navigation and axe-core WCAG checks on desktop/mobile. Frontend unit coverage now includes timezone-offset UTC metrics/filter/sort behavior (10 tests total). See UI_UX_QA.md. Automated accessibility results do not establish full conformance. All browser tests remain deterministic and isolated.


## Bilingual portfolio milestone - 2026-10-14
Demonstrate DE/EN switching with active filters, an open analysis and a fictional draft. Labels/messages/date formats change; user content and stored analysis do not. Language alone persists after reload. Explain the local bundled catalog design, no external translation request, and the English-only deterministic classifier.

Evidence: 39 backend, 14 frontend and 22 desktop/mobile browser tests pass, build/pip check pass, npm audit 0, tested en/de axe and 320/390/768/1440 layouts pass. README now documents the actual MVP. Bilingual screenshots are reusable in the later PowerPoint; exports remain pending. See ADR 0011 and docs/testing/LOCALIZATION_QA.md for limits and browser-native chrome behavior.
