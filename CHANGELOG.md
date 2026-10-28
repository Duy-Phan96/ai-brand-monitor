# Changelog

All notable project changes are documented here.

## Unreleased — proposed v0.1.0 MVP

### Fixed — 2026-10-28
- Centralized predefined topic labels across statistics, filters and mention details: Produktfeedback, Nicht relevant, Kundenservice and Allgemein in German; original labels in English.
- Switching preserves topic identifiers and expanded details without requests or stored-analysis/API changes. Unknown topics display verbatim.
- Added DE/EN unit and desktop/mobile browser regressions; see docs/testing/TOPIC_LOCALIZATION_QA.md.

### Release preparation
- Complete previously local implementation, regression suites, language catalogs, screenshots and ADR/QA evidence are prepared for PR #1 rather than a duplicate PR.
- Cross-platform Playwright Python selection, lockfile-based CI installation and dedicated Chromium E2E/release-hygiene jobs.
- Ignore rules cover SQLite sidecars, local build metadata, Python package metadata and temporary logs. Release checks inspect publishable files/history signatures, Markdown targets, fictional fixtures and dependency-map consistency without printing secret values.
- Portable public setup paths, dated historical QA boundaries and proposed release notes. No tag, merge, deployment, live provider verification or manual acceptance is implied.

### Analysis-language consistency — 2026-10-20
- Gemini prompt requests validated German/English summary, explanation and recommendation variants in one response; optional nested storage preserves existing records and server-owned provenance.
- UI selects saved wording locally or renders clearly labeled legacy/rule classification descriptions; unchanged original analysis remains expandable. No API request, model call or database write on switching.
- Deterministic explanations and known rule recommendations use DE/EN catalogs. Classification and original mention content remain unchanged.
- CSV retains its flat original-text contract; JSON includes the optional bilingual pair. No new dependency or translation provider. See ADR 0013 and ANALYSIS_LANGUAGE_QA.md for costs, limitations and executed tests.

### Fixed — 2026-10-20
- JSON exports reimport without removing IDs/nested analysis manually; import discards those fields, reanalyses and appends with database-generated IDs.
- Shared fictional-only create/import validation rejects false/non-boolean sample flags, blank/malformed required text and timezone-free publication dates with HTTP 422.
- Required text trims consistently; aware publication timestamps normalize to UTC before storage. Existing rows remain untouched/readable.
- Validation errors do not echo raw input; malformed Unicode is safely rejected.
- Offline regression coverage includes atomic invalid batches, forged metadata, actual browser download/upload round trips and UTC activity/filter/sort across Berlin/Los Angeles.
- Reconciled current architecture, transfer/provider explanations, safe acceptance demo, testing and presentation notes. See ADR 0012 and P1_FIX_VERIFICATION.md.

### Added
- Complete German/English frontend localization with browser detection, persisted language preference, state-safe switching, localized formatting and validation.
- Professional portfolio README with verified bilingual screenshots and actual architecture/testing/configuration references.
- Localization unit/browser regressions and ADR 0011, including accessibility and source-text preservation evidence.

### Changed
- UI messages retain translation-independent categories/counts and render in the current language; API values and stored analysis are unchanged.
- Explicit language-switch colors meet tested contrast requirements.

### Earlier foundation additions
- Initial project governance and repository baseline.
- MVP roadmap and acceptance criteria.
- Architecture and presentation documentation structure.
- FastAPI/SQLite persistence, deterministic analysis, optional validated Gemini adapter, fictional seed/reset, data-driven dashboard/filter/details, manual entry and JSON/CSV transfer.
- Offline test guards, dependency remediation, triage-first MD3-inspired UI and local browser/axe verification.
- Initial backend and frontend foundation files; historical implementation details are in the development journal.
