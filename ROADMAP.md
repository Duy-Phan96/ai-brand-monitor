# Roadmap

## Current status

2026-10-28 follow-up: predefined topics now use shared DE/EN display labels across statistics, filters and details, preserving stored identifiers and request-free switching. See `docs/testing/TOPIC_LOCALIZATION_QA.md` for verification. The foundation publication paragraph below records the previous milestone; PR #1 has since merged into main.
The complete fictional-data MVP is prepared for synchronization through PR #1 on `feat/project-foundation`; the owner will review and merge separately. Release validation and remaining limitations are recorded in `docs/releases/RELEASE_PREPARATION.md`. Personal acceptance, final presentation and a stable tag remain pending; publication is not acceptance.

Local baseline: 122 backend tests, 18 frontend tests and 34 desktop/mobile Chromium cases; see the release report for freshly executed results. CI now includes backend, lockfile-based frontend build/tests/audit, Linux Chromium E2E and release hygiene/history signature scanning. Only successful checks on the current PR head authorize calling that head CI-verified.

P1 input/transfer/UTC contracts are implemented (ADR 0012), as is request-free bilingual analysis display (ADR 0013). Older dated QA/audit records are historical snapshots, not current publication state.

## Phase 0 — Project initialization
- [x] Confirm MVP purpose and assignment constraints
- [x] Define preferred architecture
- [x] Establish repository workflow and engineering rules
- [x] Define MVP scope and acceptance criteria
- [x] Create initial documentation baseline
- [x] Verify complete CI on the first implementation PR (committed HEAD CI run 38605782109 succeeded as verified in the audit; current dirty-tree changes still require later CI)
- [x] Audit npm dependency advisories (6 -> 0; Vite 6.4.4 / Vitest 4.1.11; full regression suites passed)

## Phase 1 — Application foundation
- [x] Bootstrap React + TypeScript + Vite frontend (local tests/build verified; verify current PR checks before merge)
- [x] Bootstrap FastAPI backend
- [x] Define mention and analysis schemas (local tests/build verified; verify current PR checks before merge)
- [x] Add basic SQLite persistence (local tests/build verified; verify current PR checks before merge)
- [x] Add fictional demo data and repeatable seed command (local tests/build verified; verify current PR checks before merge)
- [x] Add initial responsive application shell (manual checks pending)
- [x] Verify updated unit/API tests in CI (successful on run 38554210778)
- [x] Add explicit safe demo reset CLI (database migrations remain future work)

## Phase 2 — Core monitoring
- [x] Initial data-derived dashboard (local Chromium desktop/mobile verified)
- [x] Mention list and expandable detail view (local Chromium desktop/mobile verified)
- [x] Combined search, filters and sorting (text, sentiment, platform, topic, priority, attention, dates; local browser coverage passed; verify current PR checks before merge)
- [x] Source-link behavior with missing-link fallback (local Chromium desktop/mobile verified)
- [x] Manual fictional mention creation through backend API (local Chromium desktop/mobile verified)
- [x] Validated JSON batch import and JSON/CSV export (local Chromium desktop/mobile verified)

## Phase 3 — AI integration
- [x] Record Gemini selection and historical owner-confirmed free-tier rationale (ADR 0008; current quotas/pricing are not newly verified)
- [x] Implement optional provider adapter (Gemini) and deterministic fallback (one controlled service-level live request verified; browser suite deterministic)
- [x] Structured JSON output validated with Pydantic (one controlled live response validated; quality evaluation pending)
- [ ] Executive summaries (not implemented; confirm original assignment need before expanding final MVP)
- [x] Implement transparent deterministic fallback baseline (requires quality evaluation)
- [ ] Optional local Ollama adapter (outside final MVP scope)

- [x] Bilingual DE/EN interface, state-safe switching and professional README (ADR 0011)
- [x] Bilingual analysis display without requests on language changes: saved model variants plus honestly labeled legacy/rule descriptions (ADR 0013; semantic live-provider quality still unverified)

## Phase 4 — Optimization
- [x] Material Design 3 inspired refinement (triage-first theme/layout; ADR 0010)
- [x] Mobile polish (tested 320/390/768/1440 widths; real devices pending)
- [x] Initial accessibility review (axe WCAG 2.0/2.1 A/AA and keyboard checks passed; full manual audit pending)
- [x] Error/loading/empty states (local tested scope; see browser QA report)
- [ ] Complete classification-quality review (initial offline evaluator created; larger dataset and live LLM comparison pending)

## Phase 5 — Quality assurance
- [x] Automated test suite (local tested scope; see browser QA report)
- [x] API tests (local tested scope; see browser QA report)
- [x] Browser tests (local tested scope; see browser QA report)
- [x] Responsive checks (local tested scope; see browser QA report)
- [x] Scoped local audit and input/transfer hardening (not production certification; backend advisory scan and broader hardening remain pending)
- [ ] Demo reliability check
- [x] Final MVP audit and current-state documentation reconciliation (historical records retained; original assignment confirmation and final presentation acceptance pending)

## Phase 6 — Interview deliverables
- [ ] Freeze stable MVP demonstration
- [ ] Maintain comprehensive slide deck plan with evidence and justifications
- [ ] Create complete PowerPoint presentation (.pptx)
- [ ] Export PDF presentation
- [ ] Create natural German speaker notes and presentation guide
- [ ] Complete live MVP demonstration script and fallback
- [ ] Complete technical interview Q&A
- [ ] Review and explain actual AI-assisted development process
- [ ] Collaboratively trim and polish the deck only after the comprehensive draft
- [ ] Rehearse presentation followed by live demo

## Outside final MVP — potential future extensions

The fictional-only final MVP does not require live connectors. The following are future possibilities, not acceptance blockers.

## Bonus — only after stable MVP
- Live Reddit integration
- LinkedIn integration
- Google Reviews integration
- Additional analytics or alerting
