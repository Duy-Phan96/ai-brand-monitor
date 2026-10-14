# AGENTS.md

## Project scope
Work only in this repository. The product is AI Brand Monitor, an interview-focused brand-monitoring MVP.

## Workflow
- Read this file, relevant code, ROADMAP.md and documentation before changes.
- Use feature branches. Do not implement features directly on main.
- Keep changes focused and explainable.
- Do not merge or deploy without explicit approval.

## Coding conventions
- Source code, identifiers, comments and technical documentation: English.
- Prefer clear modular code over abstractions without demonstrated value.
- Keep frontend and backend concerns separated.
- Validate all external and AI-produced data.

## Testing
- Backend: pytest.
- Frontend logic: Vitest.
- Critical user flows: Playwright.
- Never claim a test passed unless it was actually executed.

## Security
- Never commit secrets.
- Keep AI/API credentials server-side.
- Treat imported mention content as untrusted input.
- Validate URLs and structured model outputs.

## Documentation
Update relevant docs for meaningful milestones, architecture decisions, testing results and presentation-impacting changes.

## Definition of Done
A task is done only when functionality is implemented, relevant tests were executed where tooling allows, error cases were considered, documentation is current, no secrets were exposed, and ROADMAP.md reflects reality.
