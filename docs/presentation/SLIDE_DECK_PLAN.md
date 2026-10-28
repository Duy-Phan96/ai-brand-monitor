# PowerPoint Slide Deck Plan

Status: comprehensive candidate outline; final PPTX/PDF/German notes follow owner acceptance. Current evidence is in docs/testing/ANALYSIS_LANGUAGE_QA.md; earlier milestone notes below are historical, not current test/advisory status.

30-minute target: problem/scope 2 min, architecture/technology/database 7, AI process/inference/fallback 5, testing/security/limits 3, live demo 8, Q&A/buffer 5. Show safe JSON round trips, fresh IDs/analysis, fictional-only 422 validation and UTC consistency as reliability evidence. See ADR 0012. No new live Gemini request was made. The complete source is prepared for PR #1; verify its current head checks before presenting it as the published release.
Final deliverables: editable PPTX, PDF, natural German speaker notes, and separate live demo script.

## Analysis-language demonstration
Show DE→EN→DE with analysis/provenance open. New Gemini output can contain both validated language variants from one generation. Existing/rule records show labeled classification-based descriptions, not a claimed faithful translation. Original content, model/method and classifications remain unchanged; show the original-evidence disclosure. No language-switch API request, new provider or inference. Output-token ceiling increased from 800 to 1600; live bilingual response quality remains unverified. ADR 0013 documents the trade-off.

## Presentation narrative

| Slide | Topic | What to explain | Evidence to capture |
|---|---|---|---|
| 1 | AI Brand Monitor | Name, objective, assignment context | Product title |
| 2 | Business problem | Why unstructured brand mentions need triage | Representative sample cases |
| 3 | Assignment and success criteria | Relevance, sentiment, topic, action, summary, filtering and responsive UX | Acceptance criteria |
| 4 | MVP boundaries | Why representative data and a stable demo beat fragile connectors | Confirmed requirements |
| 5 | User journey | From incoming mention to actionable insight | Implemented workflow |
| 6 | Development process | Human decisions, AI assistance, revisions and review | Development journal |
| 7 | Architecture | Frontend, API, database, AI service, data flow | Architecture diagram |
| 8 | Technology rationale | React/TS/MUI vs alternatives; FastAPI/Pydantic; SQLite | ADRs |
| 9 | Data model | Mention/analysis fields and relationships | Schema and example |
| 10 | Analysis logic | Relevance, sentiment, topic, priority and recommended action | Actual service code |
| 11 | AI usage and transparency | Distinguish product LLM analysis, fallback rules and AI-supported coding | Real implementation and model metadata |
| 12 | Dashboard and UX | Material Design 3, readability, responsiveness | Screenshots and UI review |
| 13 | Core workflow | Search, filter, inspect and act | Real app screenshots |
| 14 | Reliability | Validation, errors, loading states, invalid inputs | Tests and error cases |
| 15 | Security and privacy | Keys, untrusted content, test data limits | Repository review |
| 16 | Testing | Automated checks and manual verification | Actual CI/test results |
| 17 | Challenges and revisions | Problems encountered, alternatives, changes | Journal and ADRs |
| 18 | Constraints and trade-offs | Honest MVP limitations | Current gap list |
| 19 | Future roadmap | Optional live integrations, scaling, improvements | ROADMAP |
| 20 | Live demo transition | What will be shown next | Reproducible demo scenario |

These are candidate slides, not a final count. Combine or remove slides after a full first draft and review.

## Requirements for each slide

- One clear takeaway, linked to an actual project decision or observed result.
- Speaker notes in natural German, including the underlying why.
- Ground technical claims in code, tests, requirements or documented decisions.
- Prefer diagrams, authentic screenshots and simple comparisons over text-heavy slides.
- Explicitly identify planned rather than implemented features.
- Ensure readable typography and consistent professional visual design.
- Include fallback guidance for any external dependencies.

## Demonstration after presentation

1. Open functioning application.
2. Present sample dataset and source authenticity disclosures.
3. Explain dashboard metrics.
4. Search and filter mentions.
5. Open a specific detail view and explain classification/priority.
6. Show transparent analysis method and suggested action.
7. Explain strengths, limitations and potential extensions.

This sequence must be updated to match functionality that has actually been delivered.

## Review checkpoints

- After each milestone: update decision/evidence inventory and slide relevance.
- After MVP feature freeze: collect screenshots, diagrams and verified test data.
- First deck draft: deliberately comprehensive.
- Joint review: shorten, improve storytelling, polish design and rehearse.
- Final export: verify PPTX, PDF, speaker notes and live demo against the same release.


## Historical milestone notes — 2026-10-14

Superseded test counts, advisory status and pending-inference statements below describe their individual earlier milestones. Use the current P1 report and journal outcome for final slides.

## Evidence update — Gemini timeout/test safety (2026-10-14)
Include configurable 45-second per-phase timeout, categorized fallback and pytest network isolation in the reliability/testing discussion. Evidence: 39 backend tests passed offline; no external requests. Do not claim successful live Gemini inference. Preserve the distinction between internal Windows socketpair IPC and external API traffic.


## Live-inference evidence update — 2026-10-14
Supersedes the earlier pending live-inference status: exactly one controlled Flash-Lite request returned HTTP 200 in 6.86 seconds, valid Pydantic JSON and method=llm. Show the positive/low-priority fictional classification, model identity, server-side credential boundary and fallback design. 39 network-blocked backend tests pass. Keep limits explicit: one sample, no new negative live test or browser-flow verification, no accuracy claim.


## Browser demonstration evidence — 2026-10-14
The deterministic local workflow is verified by 8 Playwright cases across Chromium desktop/mobile: metrics from stored records, combined filters, detail metadata, fictional creation, JSON import/export, CSV download, loading/error/retry/empty states. 320/768 width overflow checks and full-page screenshot inspection passed. Refresh now retains form/import success notices and details explicitly show sentiment/priority. Explain that automated browser tests use temporary data, deterministic AI and blocked external application traffic. The separate successful Gemini service request is not a live-provider browser test. Other engines, full accessibility/security review and broader classification quality remain pending; 6 npm advisories are unresolved. Detailed evidence and commands: docs/testing/BROWSER_E2E_RESULTS.md.


## Dependency audit follow-up - 2026-10-14
Supersedes the earlier unresolved npm advisory status: final Vite 6.4.4 and Vitest 4.1.11 reduce full/production npm audits to 0. 39 backend tests, 8 frontend tests, production build and 8 Chromium E2E cases passed; no live Gemini calls. Dependency rationale and residual limits: docs/testing/DEPENDENCY_SECURITY_AUDIT.md. Other browser/accessibility/security coverage and final CI remain pending.


## Professional dashboard milestone - 2026-10-14
Show overview -> Review attention queue -> View analysis -> recommendation -> How this was analyzed. Explain sentiment as tone and priority as urgency, and distinguish fictional data from authentic ingestion. Demonstrate the keyboard skip link and contrast technical disclosure with the clear next action. Expand Data tools only when adding/importing/exporting. Before/after screenshot assets are reusable in the later deck.

Evidence: 39 backend, 10 frontend, 12 browser tests pass; production build and zero npm audit findings; zero axe violations in tested desktop/mobile states. The light theme follows MD3-inspired typography, tonal surfaces, spacing and state semantics using existing MUI, not a compliance claim. No runtime chart dependency and no new live Gemini calls. Open limitations: manual screen-reader/zoom, other engines/real devices, dark mode, large datasets and final CI. See ADR 0010 and docs/testing/UI_UX_QA.md.


## Bilingual portfolio milestone - 2026-10-14
Demonstrate DE/EN switching with active filters, an open analysis and a fictional draft. Labels/messages/date formats change; user content and stored analysis do not. Language alone persists after reload. Explain the local bundled catalog design, no external translation request, and the English-only deterministic classifier.

Evidence: 39 backend, 14 frontend and 22 desktop/mobile browser tests pass, build/pip check pass, npm audit 0, tested en/de axe and 320/390/768/1440 layouts pass. README now documents the actual MVP. Bilingual screenshots are reusable in the later PowerPoint; exports remain pending. See ADR 0011 and docs/testing/LOCALIZATION_QA.md for limits and browser-native chrome behavior.


## Topic-label demonstration follow-up — 2026-10-28
Show Produktfeedback / Nicht relevant / Kundenservice / Allgemein in German statistics, then select Kundenservice and expand its mention. Switch EN→DE: labels follow the UI while the selected identifier remains `support`, details stay open and no request occurs. Explain the shared catalog helper, unknown-topic verbatim fallback and unchanged analysis storage/API. This is display localization, not multilingual classifier-quality evidence. Verification: `docs/testing/TOPIC_LOCALIZATION_QA.md`; no deck/PDF was generated for this focused fix.


## PR #2 dependency-security explanation — 2026-10-28
Explain the audit failure from two newly reported mocker advisories, the minimal Vitest/@vitest/mocker 4.1.11→4.1.12 patch and matched internal dependencies. Keep Vite 6.4.4 and product/localization behavior unchanged. Demonstrate the clean audit and existing DE/EN topic-switch regression; distinguish local verification from checks on the pushed PR head. Evidence: `docs/testing/DEPENDENCY_SECURITY_AUDIT.md`. No live Gemini request is needed.
