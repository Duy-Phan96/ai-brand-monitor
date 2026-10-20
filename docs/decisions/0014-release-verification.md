# ADR 0014 — Reviewable MVP synchronization and portable CI

Date: 2026-10-20.

## Context and options

The tested MVP lived in uncommitted source/assets while PR #1 still described an early shell. The owner requested complete GitHub synchronization but explicitly reserved the main merge. Reusing earlier green CI would not verify the new files. Windows-only test startup and floating frontend installation also limited reproducibility.

Options were to publish only docs, reuse the old CI, or include the complete reviewed candidate with portable browser and release checks. The last option was selected. Rewriting/squashing existing feature history or creating another PR was rejected; logical new commits preserve the current branch and existing review identity.

## Decision

Keep PR #1 targeting main, push reviewed feature commits normally, update its complete implementation/validation description, and wait for checks attached to its actual head. Do not merge, tag or deploy automatically. Protect private configuration, databases/sidecars and generated artifacts through repository ignore rules; retain intentional fictional screenshots as presentation evidence.

Use `npm ci` with the frontend lockfile. Playwright chooses the available local backend virtualenv for Windows/Linux or PATH Python for clean CI. Add isolated Linux Chromium E2E and dependency-free release-hygiene jobs alongside backend/frontend checks, with read-only workflow permissions. Tests require no provider credentials; package/browser installation and npm advisory queries are distinct from prohibited application inference.

A small review aid scans tracked/nonignored files and reachable history for known credential signatures, prohibits private/generated files, checks portable paths/UTF-8/local Markdown targets, PNG signatures, fictional fixtures and manifest/lock agreement. It reports locations/categories without values and self-tests with synthetic inputs. This is a bounded signature detector, not an exhaustive entropy/DLP guarantee; screenshots and intended data are also reviewed by content.

## Trade-offs and limits

Four CI jobs take longer and require package/browser registry access. Python dependencies remain ranged rather than fully locked, so clean CI remains essential; pip consistency is not a backend vulnerability scan. npm audit's zero findings is a time-specific advisory result. Archived audit/journal failures stay historical, with a clear current release report; public setup paths use placeholders instead of workstation identities.

The stable recommendation is v0.1.0 after approved merge/manual acceptance, otherwise an explicit release candidate. Main protection recommendations are documented but not silently applied. Final owner acceptance, deck/PDF/German notes, semantic live Gemini/bilingual verification and production hardening remain outside this synchronization claim.

## Verification and interview explanation

Fresh local commands and exact results are recorded in `docs/releases/RELEASE_PREPARATION.md`. CI outcomes must be read for the final PR head and reported separately from earlier runs. Explain the difference between implemented, locally tested, CI-verified, human-accepted, merged and deployed; none implies all the others.
