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
