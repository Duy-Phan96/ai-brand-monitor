# Classification evaluation

## Purpose
Measure rule-based classifier accuracy without claiming a small, convenient dataset establishes production quality.

## Dataset
The 10 fictional labels in `backend/data/evaluation_cases.json` cover straightforward reviews and questions, an ambiguous brand, negation, German text, sarcasm, and embedded instructions. Labels are illustrative, not a representative independently annotated benchmark.

## Reproduction
From `backend/` run `python -m scripts.evaluate_analysis`.

The evaluator reports accuracy for relevance, sentiment, and action-required status as well as strict all-fields-per-case accuracy. These numbers apply only to the deterministic fallback, not the hosted LLM.

## Limitations
English keyword rules do not reliably handle negation, sarcasm or German; a prompt-injection example does not establish general LLM security. Ten examples cannot support broad accuracy claims.

## Verification
The pytest check verifies execution and category coverage without imposing a misleading minimum accuracy threshold. Actual measurement should be cited with the precise commit and CI run. Live model comparison remains pending.
