# Analysis baseline — test cases

The current deterministic service is an English-only fallback, not AI inference.

| Case | Expected result |
|---|---|
| Positive Aurora headphones feedback | relevant and positive |
| Negative support complaint | relevant, action required, high priority |
| Aurora as sky phenomenon | irrelevant |
| Comfortable but disappointing battery | mixed |
| Product compatibility question | action required, medium priority |

Tests exist in `backend/tests/test_analysis.py`. CI must run them before recording a pass. Future evaluation should include sarcasm, negation, ambiguous names and German posts as failure cases.
