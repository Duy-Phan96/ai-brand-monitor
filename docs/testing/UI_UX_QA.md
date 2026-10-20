# UI/UX design and QA record - 2026-10-14

> Historical milestone report. Current 2026-10-20 verification and limitations: [P1_FIX_VERIFICATION.md](P1_FIX_VERIFICATION.md). Earlier counts/pending/advisory statements apply to their dated milestone only. That milestone was local/uncommitted; publication status is now tracked in docs/releases/RELEASE_PREPARATION.md.

## Implementation
See ADR 0010 for observed weaknesses, options, MD3-inspired tokens, architecture and trade-offs. Existing API contracts and creation/import/export behavior are preserved. Overview and triage now precede data tools; keyboard-accessible controls and provenance disclosure reduce cognitive load. UTC activity/filtering was corrected for timezone offsets.

## Evidence
- Backend pytest: 39 passed, one existing Starlette/httpx deprecation warning; pip check passed.
- Frontend Vitest: 10 passed across 3 files.
- Production build: passed (Vite 6.4.4).
- Playwright: 12 passed, desktop 1440x900 and mobile 390x844; additional 320/768 width overflow assertions passed.
- Axe-core: zero WCAG 2.0/2.1 A/AA violations in both tested expanded states.
- Keyboard: skip-to-main focus, main landmark focus and Enter-driven detail disclosure passed.
- npm audit: 0 reported vulnerabilities, including the added development-only axe checker.
- No live Gemini calls, credentials exposed, billing, pushes, merges or deployment.

The first redesigned browser run passed 8/10: creation clicks raced moving accordion layout and did not submit in two cases. A targeted run confirmed native form validity; disabling unnecessary accordion transitions and checking form validity stabilized the complete workflow. No API/server failure was inferred from that UI race.

## Screenshots for the presentation
Before/after desktop/mobile screenshots are in `docs/presentation/assets/`. Images are captured from the isolated test server, with real stored counts and fictional sample content. The expanded detail screenshot shows urgency separately from tone and technical provenance. These screenshots can be reused in a later PowerPoint; no deck was created in this task.

A separate mocked browser case checks LLM/rule labels and exact model provenance without contacting a provider. This is UI behavior evidence, not a new live inference claim.

## Readiness and open limitations
Ready for the local Chromium MVP interview demonstration within this tested scope. Charts and counts are accurate for stored test data; they do not assert social ingestion, broad classifier quality or historical growth. Browser live Gemini remains outside these deterministic tests. Screen-reader testing, zoom, Firefox/WebKit, real devices, dark mode, large-dataset behavior, richer history/analytics and final CI remain pending. Two records illustrate the layout; denser content needs further evaluation.

## Reproduce
From frontend/: `npm ci`, `npx playwright install chromium`, `npm run build`, `npm test`, `npm run test:e2e`, `npm audit`.
From backend/: `.\.venv\Scripts\python.exe -m pytest -q`.
E2E auto-starts dedicated test servers and never uses the local development database or live provider key.
