# AGENTS.md

## Project scope
Work only in this repository. AI Brand Monitor is an interview-focused brand-monitoring MVP.

## Workflow
- Read AGENTS.md, relevant code, ROADMAP.md and current documentation before changes.
- Use feature branches; never implement directly on main.
- Keep PRs focused. Do not merge or deploy without explicit approval.
- Record decisions when they happen, not retrospectively invented.

## Coding conventions
- Source code, identifiers, comments and technical documentation: English.
- Prefer clear modular code over abstractions without demonstrated value.
- Keep frontend and backend concerns separated.
- Validate all external and AI-produced data.

## Testing and security
- Backend: pytest; frontend: Vitest; critical user flows: Playwright.
- Never claim tests passed unless executed.
- Never commit secrets; keep credentials server-side.
- Treat imported content and AI outputs as untrusted.

## Documentation and explainability — mandatory
Every significant feature, dependency or architectural decision must answer:
1. What problem were we solving?
2. What options did we consider?
3. Why was this option chosen?
4. What trade-offs and limitations remain?
5. How was it implemented and verified?
6. How should it be demonstrated and explained in the interview?

Keep relevant architecture ADRs, development journal, roadmap, tests and presentation materials current. Capture actual AI assistance, prompts/purposes, human judgments, mistakes and fixes without inventing activity.

## PowerPoint and demo deliverables
A PowerPoint deck (.pptx) is a mandatory final deliverable, along with a PDF export, natural German speaker notes and a separate reproducible live MVP demo. Start with a comprehensive evidence-based slide outline, then collaboratively refine and shorten near delivery. Maintain docs/presentation/SLIDE_DECK_PLAN.md throughout development. Slides and speaker notes must describe the actual implementation, not planned features as completed.

## Definition of Done
Functionality implemented, relevant tests executed or explicitly noted as pending, errors considered, documentation/decision rationale updated, presentation impact recorded, no secrets exposed and ROADMAP.md current.
