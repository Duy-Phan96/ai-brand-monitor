# Roadmap

## Current status
Phase 1 implementation is in progress on `feat/project-foundation`. Frontend and backend CI passed on a recent commit; further documentation commits still require latest final verification.

## Phase 0 — Project initialization
- [x] Confirm MVP purpose and assignment constraints
- [x] Define preferred architecture
- [x] Establish repository workflow and engineering rules
- [x] Define MVP scope and acceptance criteria
- [x] Create initial documentation baseline
- [x] Verify complete CI on the first implementation PR (both jobs successful on run 38554210778; final PR head remains to be checked)
- [ ] Audit npm dependency advisories

## Phase 1 — Application foundation
- [x] Bootstrap React + TypeScript + Vite frontend (verification pending)
- [x] Bootstrap FastAPI backend
- [x] Define mention and analysis schemas (verification pending)
- [x] Add basic SQLite persistence (verification pending)
- [x] Add fictional demo data and repeatable seed command (verification pending)
- [x] Add initial responsive application shell (manual checks pending)
- [x] Verify updated unit/API tests in CI (successful on run 38554210778)
- [x] Add explicit safe demo reset CLI (database migrations remain future work)

## Phase 2 — Core monitoring
- [x] Initial data-derived dashboard (manual UI verification pending)
- [x] Mention list and expandable detail view (browser verification pending)
- [x] Combined search, filters and sorting (text, sentiment, platform, topic, priority, attention, dates; CI and browser verification tracked separately)
- [x] Source-link behavior with missing-link fallback (browser verification pending)
- [x] Manual fictional mention creation through backend API (browser QA pending)
- [x] Validated JSON batch import and JSON/CSV export (browser QA pending)

## Phase 3 — AI integration
- [ ] Evaluate current providers and costs
- [x] Implement optional provider adapter (Gemini) and deterministic fallback (live API validation pending)
- [x] Structured JSON output validated with Pydantic (live validation pending)
- [ ] Executive summaries
- [x] Implement transparent deterministic fallback baseline (requires quality evaluation)
- [ ] Optional local Ollama adapter

## Phase 4 — Optimization
- [ ] Material Design 3 refinement
- [ ] Mobile polish
- [ ] Accessibility review
- [ ] Error/loading/empty states
- [ ] Performance and classification-quality review

## Phase 5 — Quality assurance
- [ ] Automated test suite
- [ ] API tests
- [ ] Browser tests
- [ ] Responsive checks
- [ ] Security review
- [ ] Demo reliability check
- [ ] Documentation audit

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

## Bonus — only after stable MVP
- Live Reddit integration
- LinkedIn integration
- Google Reviews integration
- Additional analytics or alerting
