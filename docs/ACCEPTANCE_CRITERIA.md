# MVP Acceptance Criteria

The MVP is acceptable for interview demonstration when all mandatory criteria below are verified. Automated release evidence does not substitute for product-owner acceptance; record manual results separately using the final audit checklist and current demo script. Publishing PR #1 does not imply manual sign-off.

## Analysis
- Every mention has relevance, sentiment, topic, action-required status, priority, summary/explanation and analysis method.
- Sentiment and urgency are separate concepts.
- Model output is validated before persistence.
- Deterministic fallback is labeled transparently.

## Dashboard
- Metrics reflect the actual stored dataset.
- Sentiment distribution, topics, activity and action-required counts are visible.
- No fabricated business KPI is presented.

## Mention workflow
- Users can list, search, filter, sort and inspect mentions.
- Missing source URLs are handled gracefully.
- Example data is visibly distinguished from genuine public content.
- Manual creation and import/export are functional.

## UX
- Desktop and mobile layouts are usable.
- Important loading, error and empty states exist.
- Interactive controls are distinguishable from informational badges.

## Quality
- Clean checkout setup is documented.
- Relevant automated tests pass.
- Critical demo flow is manually verified.
- No secrets are committed.
- Presentation documentation matches the code.
