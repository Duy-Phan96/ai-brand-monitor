# PowerPoint Slide Deck Plan

Status: first comprehensive outline, to be refined as features are implemented.
Final deliverables: editable PPTX, PDF, natural German speaker notes, and separate live demo script.

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
