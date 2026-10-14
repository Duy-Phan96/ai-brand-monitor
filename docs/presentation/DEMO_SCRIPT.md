# Demo Script

Status: initial outline. This file will be expanded only as real functionality becomes available.

## Intended flow
1. Start backend and frontend.
2. Open the dashboard.
3. Explain the sample-data approach.
4. Review summary metrics.
5. Filter mentions by sentiment, platform, topic and priority.
6. Open a mention that requires action.
7. Explain relevance, sentiment, urgency, priority and suggested action.
8. Show analysis-method transparency.
9. Demonstrate source-link behavior.
10. Explain limitations and next steps.

## Fallback principle
The core demo must remain functional without an external LLM API.

## Reproducible reset before a demo
Run from `backend/`:
```bash
python -m scripts.reset_demo --confirm
```
The command removes and restores fictional sample records in one transaction. It refuses to run if any non-sample records exist. Clearly disclose that the five initial posts are fictional and their analysis currently uses deterministic rules rather than real LLM inference.

Demonstration sequence: dashboard metrics → filter and open a record → import fictional JSON → inspect action priority → export results. A real LLM demonstration will be added only after verified integration.
