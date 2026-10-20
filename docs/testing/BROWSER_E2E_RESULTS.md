# Browser E2E QA — 2026-10-14

> Historical milestone report. Current 2026-10-20 verification and limitations: [P1_FIX_VERIFICATION.md](P1_FIX_VERIFICATION.md). Earlier counts/pending/advisory statements apply to their dated milestone only. That milestone was local/uncommitted; publication status is now tracked in docs/releases/RELEASE_PREPARATION.md.

## Executed scope and results

- Playwright 1.64.1, Chromium 156, Windows; one worker, zero retries.
- **8 browser tests passed in 18.9s**: four scenarios each at desktop 1440x900 and mobile 390x844. Additional overflow checks passed at widths 320 and 768.
- Backend: **39 pytest tests passed**, one existing Starlette/httpx deprecation warning; pip check passed.
- Frontend: **8 Vitest tests passed** across three files; production TypeScript/Vite build passed.
- Desktop and mobile full-page screenshots were visually inspected. The layout showed readable cards and controls with no horizontal overflow in checked widths.

## Reproduce on this Windows workspace

From `backend/`, install the editable project with development extras into `.venv` per README. From `frontend/`:

```powershell
npm ci
npx playwright install chromium
npm run test:e2e
npm run build
npm test
```

The committed-intent npm lockfile pins the resolved dependency graph. No commit was created. Playwright starts and stops dedicated servers on 127.0.0.1:8011 and 127.0.0.1:5174. It refuses to reuse existing servers so a user's development server/database cannot be mistaken for the test server. The current backend launch command targets the Windows `.venv`; other platforms require adjusting that interpreter path.

Backend offline tests:

```powershell
.\.venv\Scripts\python.exe -m pytest -q
```

Playwright HTML results: `frontend/playwright-report/index.html`; failure traces and screenshots: `frontend/test-results/`. Use `npx playwright show-report` for the local HTML viewer. These outputs are ignored by Git.

## Isolation and network safety

`backend/tests/e2e_server.py` is a test-only server wrapper, not a production route change. It allocates a new temporary SQLite path per run, disables dotenv loading, clears the key and forces deterministic analysis before importing the app. `/__test/reset` exists only in this wrapper and clears only that isolated database before each scenario. Tests run serially to avoid database races. The user's database and root `.env` are untouched.

Backend HTTPX real transports and non-loopback socket connects are blocked; Windows internal loopback IPC is allowed. Browser HTTP and WebSocket routing allows only the dedicated frontend origin and fails teardown if other traffic is attempted. Service workers are disabled. Fixture API requests use only the dedicated localhost test endpoints. This is test isolation, not a machine-wide firewall for arbitrary native/subprocess networking.

No Gemini requests or API-key transmission occurred. Package registry and Playwright browser downloads were needed for setup; they are distinct from application API traffic. No billing, push, merge or deployment.

## Covered workflows

1. Seed two fictional records through the real API and compare dashboard totals, positive/negative counts and attention counts with stored analysis.
2. Search plus sentiment/platform/topic/priority/date/attention filters; clear filters; verify details, sentiment, priority, deterministic method and missing-source fallback.
3. Create a fictional mention through the actual form and confirm persisted list entry and retained success message.
4. Import fictional JSON through the file input; compare actual downloaded JSON to database API records and CSV header/content/row count.
5. Delay the API response to verify loading; simulate 503 and test Retry; verify an empty real database.
6. Simulate create HTTP 500 and invalid import data; assert errors and unchanged storage.
7. Check desktop/mobile interaction and horizontal overflow at four widths.

## Confirmed UI issues fixed

- Refreshing after create/import unmounted the forms and erased their success notices. Dashboard content now remains mounted after its first successful load, with a separate refresh progress indicator.
- Initial load errors displayed zero metrics and an empty-data message even though data had never loaded. Content is now rendered only after a successful load; initial errors show the error and retry control.
- Details did not explicitly show sentiment and priority, particularly low-priority mentions without an attention chip. Added both fields and browser assertions.

Initial harness problems were also corrected: Windows executable quoting, ambiguous alert selectors, missing Node types for the proxy configuration, and Vitest accidentally collecting Playwright specs. These were test/tool setup issues, not additional product bugs.

## Readiness and limitations

The deterministic core MVP workflow is ready for a controlled local Chromium browser demonstration at the tested viewports. Previously verified Gemini service inference remains separate evidence; the browser suite intentionally never invokes Gemini. A browser-based live Gemini flow, Firefox/WebKit, real devices, full accessibility audit, large datasets, rapid concurrent refreshes and classifier-quality evaluation remain unverified.

npm continues to report **6 advisories (3 moderate, 1 high, 2 critical)** in existing development dependencies. No breaking upgrade was applied. Dependency security remediation remains a separate unresolved quality item. This QA is not a production/security approval or final CI verification.


## Dependency audit follow-up - 2026-10-14
Supersedes the earlier unresolved npm advisory status: final Vite 6.4.4 and Vitest 4.1.11 reduce full/production npm audits to 0. 39 backend tests, 8 frontend tests, production build and 8 Chromium E2E cases passed; no live Gemini calls. Dependency rationale and residual limits: docs/testing/DEPENDENCY_SECURITY_AUDIT.md. Other browser/accessibility/security coverage and final CI remain pending.
