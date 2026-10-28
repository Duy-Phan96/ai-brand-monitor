# Dependency security audit — 2026-10-14

> Historical milestone report. Current 2026-10-20 verification and limitations: [P1_FIX_VERIFICATION.md](P1_FIX_VERIFICATION.md). Earlier counts/pending/advisory statements apply to their dated milestone only. That milestone was local/uncommitted; publication status is now tracked in docs/releases/RELEASE_PREPARATION.md.

## PR #2 follow-up — 2026-10-28

The 4.1.11 result below is historical and is superseded by this patch remediation. Current tree: Vitest **4.1.12**, @vitest/mocker **4.1.12**, Vite **6.4.4**. `package.json` requires Vitest `^4.1.12`; the regenerated lockfile pins the matched Vitest packages to 4.1.12.

Before audit: **2 moderate affected-package findings** (mocker plus propagation to Vitest), encompassing these two advisories:

- [GHSA-qxg6-89mg-rqv8](https://github.com/advisories/GHSA-qxg6-89mg-rqv8): unauthenticated manual mock registration can inject generated module code when an attacker can reach the development server.
- [GHSA-xp26-3454-mjgp](https://github.com/advisories/GHSA-xp26-3454-mjgp): Windows backslash traversal bypasses the earlier redirect allowlist fix.

Both maintainer advisories identify 4.1.12 and 5.0.3 as patched. Chose the smallest 4.x patch, keeping the version-matched internal packages together through Vitest's own dependencies. A Vitest 5 migration, transitive overrides, adding mocker as a direct dependency and relaxing the audit threshold were unnecessary. Registry metadata accepts Vite 6 and Node 22 used by CI (engines: ^20 || ^22 || >=24).

`npm install --save-dev vitest@4.1.12` changed only vitest and seven matched @vitest packages (expect, mocker, pretty-format, runner, snapshot, spy, utils); all moved 4.1.11→4.1.12. Other package versions remain unchanged. Application localization code/tests/contracts remain unchanged. The low audit threshold remains enforced.

Local verification after clean `npm ci` (Node 24.14.0 / npm 11.9.0):

| Check | Result |
|---|---|
| `npm ci` | Passed; reproduced the patched lockfile |
| `npm test` | 22 passed, 6 files, Vitest 4.1.12 |
| `npm run build` | Passed; unchanged index-CJTAsVJx.js (502.71 kB / 157.52 kB gzip) |
| `npm run test:e2e` | 36 passed, desktop/mobile Chromium, 1.5m, zero retries |
| `npm audit --audit-level=low` | 0 vulnerabilities |
| `npm audit --omit=dev` | 0 vulnerabilities |
| Release-check self-test/history scan | Passed, zero findings |
| `git diff --check` | Passed |

All existing DE/EN topic, state-retention, request-free switching, analysis, input/export and accessibility scenarios passed without changing tests or product sources. The existing Vite chunk-size and Playwright color-environment warnings remain. No new local backend test run was needed for this frontend tooling-only patch; the pushed-head CI backend job remains required.

CI evidence: previous run [40698963742](https://github.com/Duy-Phan96/ai-brand-monitor/actions/runs/40698963742) failed only the frontend low-threshold audit after passing its build/tests. The patch will be pushed to the same PR #2; current-head Actions results must be checked after pushing and reported separately, rather than inferred from local success.

No live Gemini requests, secret exposure, merge or deployment. Tests retain isolated fictional data and blocked external application traffic. An audit with zero findings records currently known registry advisories, not a general security certification. For an interview, explain why a patch dependency update repaired CI without changing the localized product behavior; show the audit and topic-switch regression.

## Historical outcome — 2026-10-14
Full npm audit: **6 affected-package findings before, 0 after**. Before: 3 moderate, 1 high, 2 critical. These include dependency-chain propagation, not six independent CVEs. Production-only audit (`npm audit --omit=dev`): **0 before and after**. All affected packages were in development tooling.

## Affected paths and potential impact

| Package | Severity | Dependency path | Potential impact |
|---|---|---|---|
| vite | high | root devDependency; also Vitest and React-plugin dependency/peer paths | Dev-server filesystem deny bypass/path traversal; Windows UNC handling can disclose NTLM credentials; inherited esbuild issue |
| esbuild | moderate | root -> vite -> esbuild (also old Vitest -> vite-node -> vite) | Cross-origin access to the development server can expose content |
| vitest | critical | root devDependency | Vulnerable UI-server file read/execution and mock redirect path traversal; propagated worker/build-tool issues |
| @vitest/mocker | moderate | root -> vitest -> @vitest/mocker | Mock redirect path traversal/arbitrary file read |
| tinypool | critical | root -> vitest -> tinypool | Prototype-pollution worker options can enable code execution; actual exploitability depends on attacker-controlled inputs |
| vite-node | moderate | root -> vitest -> vite-node -> vite | Inherited vulnerable Vite dependency |

Development-only does not mean harmless: these packages execute with developer permissions and may serve local files. This MVP did not run Vitest's UI server or expose the dev server publicly, reducing those specific exposure paths, but affected versions still warranted remediation. No evidence of exploitation was investigated or claimed.

## Smallest verified remediation

- Direct Vite: **5.4.21 -> 6.4.4** (`^6.4.4`).
- Direct Vitest: **2.1.9 -> 4.1.11** (`^4.1.11`).
- Transitive esbuild: **0.21.5 -> 0.25.12**.
- @vitest/mocker and other matched @vitest packages: **2.1.9 -> 4.1.11**.
- Old tinypool and vite-node chains are no longer installed.
- npm regenerated package-lock.json normally; no overrides, --force or audit-fix automation.
- React/ReactDOM 18.3.1, Material UI/icons 6.5.0, TypeScript 5.9.3, React plugin 4.7.0 and Playwright 1.64.1 remain unchanged. No application code/config migration was needed for these dependency updates.

## Options and compatibility reasoning

Patch-only updates within original Vite 5/Vitest 2 ranges do not leave the affected audit ranges. Vitest 3 still falls within the mocker advisory range (<4.1.11); Vitest 4.1.11 is the earliest patched 4.x version identified for that advisory and removes the vulnerable worker chain. Its metadata supports Vite 6/7/8. The current React plugin accepts Vite 6, so upgrading it or React/MUI is unnecessary.

Vite 7.3.7 plus Vitest 4.1.11 was initially tested successfully. Registry review identified patched Vite 6.4.4, so the final selection was reduced to Vite 6 to minimize major-version movement and avoid Vite 7 browser-target/Node changes and Vite 8's Rolldown/Oxc migration. Final Vite 6 audit and all suites passed. Manually overriding incompatible transitive majors would risk unsupported combinations and was rejected. The existing MVP uses a simple SPA config, standard React plugin and basic Vitest APIs; none of the removed low-level migration APIs are used.

Verified runtime: Node 24.14.0, npm 11.9.0, Python 3.14.3. Node 22 remains within the final tools' supported engine ranges. Compatibility is empirically established on this workstation, not every environment. An intermediate npm ci reproduced the Vite 7 lockfile; final Vite 6 lockfile was generated by npm install and audited. Future installations should use npm ci.

## Final verification

- Backend pytest: **39 passed**, one existing Starlette/httpx deprecation warning, 2.80s.
- Backend pip check: no broken requirements.
- Frontend Vitest 4.1.11: **8 passed**, 3 files, 350ms.
- Vite 6.4.4 production build: **passed**, 923 transformed modules, 3.16s.
- Playwright E2E: **8 passed in 20.0s**, desktop/mobile Chromium, zero retries.
- Full and production-only npm audit: **0 vulnerabilities**.
- Tests retained deterministic AI, blocked external application traffic and isolated SQLite. No live Gemini requests, key exposure, billing, commits, pushes, merges or deployment. Registry/audit/download requests were limited to dependency work.

## Remaining risks and next milestone

Ready for the next local UI/UX milestone within the verified MVP scope. Zero npm findings means no currently reported advisories for this installed tree, not a full security certification. Full accessibility/security review, other browser engines, larger datasets and final CI remain pending. Keep dev servers loopback-only and rerun audits periodically. Backend deprecation warning remains unrelated and unresolved. Free-tier provider settings were not changed.

## Primary references

- [Vite 6 migration](https://v6.vite.dev/guide/migration)
- [Vitest migration](https://vitest.dev/guide/migration/)
- [Vite 8 migration](https://vite.dev/guide/migration) (why latest-major migration was avoided)
- Registry version/engine/peer metadata was queried with npm view.

## Advisory references from the actual before-audit response
- [Vitest: Path Traversal / Arbitrary File Read via @vitest/mocker Redirect Mock](https://github.com/advisories/GHSA-82fw-gwwq-j7x9)
- [esbuild enables any website to send any requests to the development server and read the response](https://github.com/advisories/GHSA-67mh-4wv8-2f99)
- [Tinypool: Prototype Pollution gadget in worker options leads to Remote Code Execution](https://github.com/advisories/GHSA-5gmw-xhrv-c9v3)
- [Tinypool: Prototype Pollution Gadget to RCE in run() options](https://github.com/advisories/GHSA-85c8-ppgw-ccpr)
- [Vite Vulnerable to Path Traversal in Optimized Deps `.map` Handling](https://github.com/advisories/GHSA-4w7w-66w2-5vf9)
- [launch-editor: NTLMv2 hash disclosure via UNC path handling on Windows](https://github.com/advisories/GHSA-v6wh-96g9-6wx3)
- [vite: `server.fs.deny` bypass on Windows alternate paths](https://github.com/advisories/GHSA-fx2h-pf6j-xcff)
- [When Vitest UI server is listening, arbitrary file can be read and executed](https://github.com/advisories/GHSA-5xrq-8626-4rwp)
