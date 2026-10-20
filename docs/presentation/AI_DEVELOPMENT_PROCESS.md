# AI Development Process

## Development assistance
AI is used as an engineering assistant for planning, implementation support, documentation, review and test design.

## Product AI
Product-level AI analysis is a separate concern. The optional Gemini adapter is implemented. Its output is validated before storage and labeled with backend-owned provenance; rules are labeled separately.

## Transparency rule
The application must distinguish:
- AI-assisted software development
- actual model inference
- deterministic/rule-based analysis
- human decisions

Simulated results must never be presented as genuine model inference.

## Model-provider configuration choice
A real runtime LLM provider can be enabled via an untracked local environment file. The developer chose to reuse an existing Google AI Studio Free-tier project instead of opening billing. The application defaults to offline classification and only labels validated live provider responses as actual LLM output. The journal records one successful controlled service request on 2026-10-14. This historical result does not prove current availability, multilingual quality or live browser coverage; no new generation was made in the audit/P1 work.

## Analysis language decision — 2026-10-20
The owner requested consistent German/English analysis wording without repeated inference. AI assistance evaluated templates versus stored translations and selected a hybrid: one-response bilingual model wording for future analyses, honest local classification descriptions for old/rule records. No old records were rewritten and no live request was made. Tests caught a CSV compatibility regression from the new nested field; CSV was explicitly kept flat while JSON retains both languages. See ADR 0013 and ANALYSIS_LANGUAGE_QA.md for executed evidence and remaining semantic limitations.

## 2026-10-20 acceptance preparation
The owner explicitly prioritized fictional-only safety and four audit defects. AI assistance implemented schema separation, metadata discard/reanalysis, text/UTC validation, regression tests and documentation reconciliation. Initial new browser tests used an incorrect chart label and assumed IDs restart after test reset; these harness mistakes were corrected rather than changing the product. Human acceptance and the final presentation remain pending. See ADR 0012 and the P1 verification record for evidence, choices and limits.
