# README and bilingual interface QA - 2026-10-14

> Analysis-language display now follows ADR 0013; latest evidence: [ANALYSIS_LANGUAGE_QA.md](ANALYSIS_LANGUAGE_QA.md). The interface-only source-text boundary below describes the earlier milestone.

> Historical milestone report. Current 2026-10-20 verification and limitations: [P1_FIX_VERIFICATION.md](P1_FIX_VERIFICATION.md). Earlier counts/pending/advisory statements apply to their dated milestone only. That milestone was local/uncommitted; publication status is now tracked in docs/releases/RELEASE_PREPARATION.md.

## Delivered
Rewritten GitHub README with actual relative-path screenshots, a Mermaid architecture diagram, feature/technology rationale, AI pipeline/provenance, Windows startup, credential-free configuration, testing, privacy, scope and presentation links. All claims distinguish local evidence from final CI/production readiness.

The existing interface now uses bundled en/de i18next catalogs. The accessible header switch detects the primary browser language on first visit, persists a valid preference and changes document lang. Filters, drafts, disclosures and retained messages survive switching. Dates/numbers and plural forms are localized. API enums, user inputs and stored content/analysis are not rewritten or automatically translated.

## Actual checks
- Backend pytest: **39 passed**, one existing Starlette/httpx deprecation warning; pip check passed.
- Vitest: **14 passed**, 4 files, including four new localization/catalog tests.
- Production build: passed; Vite 6.4.4. Main JS roughly 497 kB minified, 156 kB gzip.
- Playwright: **22 passed** across desktop/mobile Chromium.
- Native localized URL validity and retained HTTP error messages verified in both languages.
- Browser preference detection, persistence, keyboard switching and blocked storage verified.
- Filter selection, open details, authored platform/content and existing import error preserved during switching.
- Original English mention content remained identical in the German UI.
- 320/390/768/1440 width checks passed in both languages.
- Axe WCAG 2.0/2.1 A/AA scans found no violations in tested expanded en/de desktop/mobile states.
- npm audit: **0 vulnerabilities**.

Test servers use isolated SQLite, deterministic AI and outbound transport/origin guards. No real Gemini or external translation requests, credential exposure, billing changes, pushes, merges or deployments. Dependency-install/audit requests are separate from application API traffic.

## Findings and resolutions
Initial localization verification exposed language-switch contrast and an encoding-sensitive validation-message lookup. Fixed explicit control colors and typed UIError keys/status; messages are translated at render so an existing error switches correctly. Native required/URL messages use the app language, and validity is cleared on input/language changes. Human-provenance help no longer incorrectly implies AI generation.

## Screenshot evidence
Four actual isolated browser captures exist locally (currently untracked) under docs/presentation/assets/: dashboard-en-desktop.png, dashboard-de-desktop.png, dashboard-en-mobile.png and dashboard-de-mobile.png. One fictional mention was created through the test API for each capture. No metrics were fabricated and no live LLM analysis is represented by the deterministic screenshot data.

## Limitations
Interface localization is complete for app-controlled text; original source data is intentionally unchanged. Browser/OS date-picker and file-picker chrome may use the OS language. The deterministic classifier remains English-only; German labels do not prove German classification quality. Screen-reader/zoom/other engines/real devices and final CI remain pending. Storage denial supports switching but cannot persist the preference. Filters/drafts are retained only within the current page session; only language persists after reload. The final PowerPoint/PDF exports have not been created by this task.

## Reproduce
frontend/: npm ci; npx playwright install chromium; npm test; npm run build; npm run test:e2e; npm audit.
backend/: .\.venv\Scripts\python.exe -m pytest -q.
