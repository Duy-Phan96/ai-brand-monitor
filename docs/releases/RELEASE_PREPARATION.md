# MVP Release Preparation

Date: 2026-10-20 (Europe/Berlin). Release candidate: `feat/project-foundation`, [PR #1](https://github.com/Duy-Phan96/ai-brand-monitor/pull/1), targeting `main`.

## Scope and publication boundary

The owner authorized committing and pushing the complete locally tested MVP and updating the existing PR. **Merge, tag creation and deployment are deliberately left to a separate owner action.** The feature branch and its history are preserved; no force push or history rewrite is used. Exact final head SHAs and CI run outcomes are reported in the synchronization handoff. The GitHub checks attached to the current PR head are the source of truth; a previous green run is not approval of a newer head.

The MVP includes fictional SQLite data, monitoring/triage, search/filter/sort/details, safe creation and import/export, DE/EN UI and analysis presentation, optional validated Gemini with offline fallback, automated QA and interview documentation. There are no real social connectors, automatic responses or production deployment. Personal acceptance and final PPTX/PDF/German speaker notes remain pending.

## Validation record

Fresh local execution on 2026-10-20 (Windows, Python 3.14.3, Node 24.14.0, npm 11.9.0):

| Check | Actual result |
|---|---|
| Backend pytest | **122 passed, 1 warning in 4.82s** |
| pip check | **No broken requirements found.** |
| Frontend Vitest | **18 passed, 5 files, 514 ms** |
| Production build | **Passed**, 962 modules, 3.25s; JS 502.21 kB / 157.27 kB gzip |
| Playwright Chromium | **34 passed in 60.0s**, one worker, zero retries, desktop/mobile plus DE/EN/UTC/axe/zero-request language cases |
| Full npm audit | **0 reported vulnerabilities** (all severities), 218 dependency metadata entries |
| Production-only npm audit | **0 reported vulnerabilities** |
| npm dependency tree | `npm ls --depth=0` succeeded; manifest/lock maps also checked by release hygiene |
| Offline classification evaluator | 10 illustrative cases: relevance 100%, sentiment 70%, action-required 90%, strict three-field agreement 70%; not a production-quality benchmark |
| Secret/hygiene self-test | **Passed**; synthetic detections and allow/prohibited paths checked |
| Publishable-file and history scan | **0 findings** after public-path cleanup; precommit scan covered 126 candidates, 41 local Markdown targets, 10 PNG signatures and 132 pre-existing history blobs; subsequent scans include new commits |

Six dashboard/detail screenshots were refreshed from this passing suite; four older before/after assets remain explicitly historical design evidence. Build chunk-size (>500 kB), existing Starlette/HTTPX deprecation and E2E color-environment warnings remain nonfatal. No product/runtime dependency was changed for release preparation. No live Gemini request or personal-data reset was used.

CI is verified separately after push against the exact PR head, including fresh Linux/Python 3.12/Node 22 installation. Do not substitute the local table or old workflow runs for those checks. Full history/file scanning is signature-based, not an exhaustive security guarantee.

## Security and repository hygiene

The reviewed publication set consists of source, dependency manifests/lockfile, fictional JSON fixtures, tests, CI, documentation and ten authentic browser screenshots. Root `.env`, virtual environments, local SQLite databases (including acceptance data), sidecars, package/build caches, test output, logs and TypeScript build metadata are excluded. No local credential values are read into the report or logged.

`scripts/release_checks.py` checks tracked/nonignored candidates, prohibited paths and SQLite signatures, known provider/private-key/credential signatures, personal home paths, UTF-8, local Markdown targets, PNG headers, fictional fixtures and package/lock dependency maps. `--history` scans reachable Git blobs as well. Matches are reported by location/category without printing values. Its synthetic self-test validates the detector. This bounded signature scanner is not an exhaustive entropy/DLP audit or guarantee that no undiscovered secret exists.

Initial scan found two public-documentation files containing workstation-specific home paths, not credential signatures. Those paths were replaced with portable examples. Existing ignored personal/local data remain untouched. Screenshot content is fictional Aurora examples and application UI, not browser chrome, real accounts or customer content. Historical diagnostic mistakes remain documented rather than erased or misrepresented.

## CI and reproducibility

GitHub Actions has four jobs: `backend` (Python 3.12 pytest and pip check), `frontend` (Node 22 npm ci/build/Vitest/npm audit), `e2e` (isolated Linux Chromium desktop/mobile), and `release-checks` (full-history signature scan and documentation/file hygiene). Permissions are read-only. Playwright uses a local Windows/Linux backend virtualenv if available, otherwise PATH Python. It does not reuse a user's development server/database; application network guards and deterministic mode remain enabled.

No provider key or live-generation secret is required for CI. Registry package/audit and browser installation traffic are infrastructure setup, not application Gemini requests. Tests, body-size/authentication limits, semantic translation limits and English-only rule quality remain as documented in the architecture/ADRs and prior QA.

## Version/tag recommendation

Use **`v0.1.0`** as the first stable MVP tag after owner review, successful checks for the merged source and personal acceptance. Package versions already use 0.1.0. If manual acceptance is still outstanding, use a clearly identified release candidate such as `v0.1.0-rc.1` instead of calling it accepted/stable. No tag or GitHub Release is created in this task. Target the eventual `main` merge commit, not an unmerged feature-only commit. Proposed notes are in [v0.1.0.md](v0.1.0.md).

## Main branch protection recommendation

- Require pull requests, resolved review conversations and current successful `backend`, `frontend`, `e2e`, `release-checks` status checks before merge; make the branch up to date when feasible.
- Disable force pushes/deletion and avoid administrator/bypass exceptions. Keep secret scanning/push protection enabled if available for this repository/account.
- Require an independent approval if another reviewer is available. For a solo owner, do not introduce an impossible self-approval gate; retain checks and explicit owner review.
- Consider squash merge to present the final MVP as a coherent main-branch change while retaining the feature branch/history for traceability. Do not delete it automatically.

Protection settings were not modified or certified by this task; these are recommendations for the owner, not a claim of enforcement. No required check may be bypassed to resolve a failure.

## Final demo reproducibility

1. After merge, clone/check out the approved commit/tag; install Python 3.12+ and Node 22+, backend development extras and frontend with `npm ci`.
2. Use a new dedicated acceptance database path and process-only `AI_PROVIDER=deterministic`, `PYTHON_DOTENV_DISABLED=1`, empty key, following the [demo script](../presentation/DEMO_SCRIPT.md). Seed existing fictional JSON; never reset a wanted development/personal database.
3. Start backend/frontend locally; verify health and five fictional deterministic records. Demonstrate triage, DE/EN switching without API calls, original provenance, safe input validation and JSON download/reimport with new identities.
4. Keep recorded screenshots and offline workflow as fallback; a new live Gemini demonstration requires separate scope, fictional input and quota consideration. Historical success does not verify current availability or the revised bilingual prompt.
5. Record owner acceptance, then finalize the 30-minute deck/demo/Q&A, PPTX/PDF and German notes against that same source snapshot. Release publication alone is not acceptance evidence.
