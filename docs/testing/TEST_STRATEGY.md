# Test Strategy

## Goals
Verify business rules, API contracts and the critical demonstration flow without overbuilding test infrastructure.

## Backend
Use pytest for:
- schema validation
- analysis rules and fallbacks
- API success/error cases
- persistence behavior

## Frontend
Use Vitest for:
- filtering and transformation logic
- component behavior where logic matters

## End-to-end
Use Playwright for the final critical flow:
1. open dashboard
2. filter mentions
3. open a detail view
4. verify analysis metadata
5. open or gracefully handle a source link

## Reporting rule
Only executed tests may be reported as passed.

## CI and packaging regression record (2026-10-14)
- Initial frontend TypeScript build failed with TS5096; adjusted node tsconfig to noEmit. A subsequent GitHub Actions frontend job passed.
- Backend editable installation failed after introducing a top-level data directory. Added an explicit setuptools package selection to prevent automatic detection of demo data as source package.
- The packaging fix requires confirmation in a new workflow run.
- The npm installation previously reported vulnerability advisories. Audit versions, affected packages and remediation before release rather than applying breaking upgrades blindly.
