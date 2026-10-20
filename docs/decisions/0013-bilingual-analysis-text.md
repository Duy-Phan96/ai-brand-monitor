# ADR 0013 — Bilingual analysis wording without inference on language changes

Date: 2026-10-20. Supersedes ADR 0011's original display boundary for analysis text only.

## Problem

The interface switched between German/English, but summary/explanation/recommendation strings were displayed directly from stored analysis. German labels therefore surrounded English model/rule prose. The owner requires both languages, existing-record support and no new inference when switching.

## Options

1. Translate or reanalyse on every switch: rejected because of provider cost, latency, privacy and changed classification risk.
2. Require two saved translations and backfill every old record through Gemini: good free-text fidelity, but requires unrequested external calls and mutates old evidence.
3. Render all analysis from classification templates: works offline for every record, but loses detailed model reasoning in the main view.
4. Save both model text variants in the original generation; use honest classification-based local descriptions for records without them: selected hybrid.

## Decision

New Gemini prompts request `localized_text.de` and `.en` in the **same** response. Each contains summary, explanation and nullable suggested_action. Scalar summary/explanation/suggested_action remain for original-evidence and compatibility. The prompt asks for English scalar prose, equivalent German/English localized prose and unchanged language-independent classification. Backend-assigned method/model remain authoritative.

Pydantic validates the pair with bounded, nonempty trimmed strings and forbids extra fields. The pair is optional for legacy/provider compatibility; when present, both languages are required. Malformed bilingual output triggers the existing validated-response fallback; a missing pair is handled by local derived text without another generation. Structural validation cannot certify actual language, semantic equivalence, truth or translation quality.

The existing serialized analysis JSON stores the optional pair without a table migration. Old rows lack the pair and remain readable. Reading or changing UI language does not write, migrate, translate or analyse a row. The optional field may appear as null in API/JSON output for old rows, while their persisted JSON is unchanged. JSON exports include the pair. CSV retains its existing flat original-text columns; import still discards the entire exported analysis and computes fresh analysis under ADR 0012.

`frontend/src/analysisText.ts` selects the current saved variant without HTTP. Without a pair it renders a localized summary of sentiment/relevance/priority, an explanation of the stored classification method/action flag and general review guidance. It does **not** pretend to translate the old model's nuanced free text. The UI explicitly labels this distinction and exposes the unchanged original scalar analysis in a separate untranslated disclosure. Human analysis is also identified separately.

Deterministic records use the same local catalogs for explanations/summaries. The two known historical rule recommendation strings map to localized support/question instructions; other action-needed records get generic review guidance. No action is proposed when the stored action_required flag is false. A recognized exact historical Gemini-failure suffix is displayed as a localized fallback notice only for deterministic records; arbitrary model prose is not treated as metadata. Original explanations remain inspectable.

Original mention content, topic/platform metadata, relevance/sentiment/priority/action_required, method/model and other stored evidence remain unchanged. There is no second translation provider, endpoint, background job or fetch on language switching.

## Costs and trade-offs

- Asking both languages in one generation adds output tokens. The output budget rises from 800 to 1600 tokens to accommodate the pair; this is a ceiling, not a claim about actual token use/cost. No retries or additional requests were added. The default remains deterministic.
- Existing arbitrary monolingual model prose cannot be faithfully translated without translation data or an inference/translation engine. The derived view deliberately sacrifices nuance and directs users to original evidence. It is not the original model's reasoning or recommendation translated verbatim.
- Rules remain an English-only classifier. German display does not improve German classification accuracy.
- Free-form topic/platform values remain data; they are not automatically translated. Untranslated original analysis is deliberately available on request, not mislabeled as localized text.
- Provider compliance and semantic quality of the revised bilingual prompt remain unverified live. All Gemini responses in new tests are mocked, and browser model examples are labeled fixtures.
- No existing personal/development/acceptance database was rewritten or reset. No dependency was added.

## Verification and demonstration

Backend tests use one MockTransport response to persist both languages and verify repeated reads do not generate again; original content and server-assigned provenance remain intact. Legacy rule/LLM/human rows are read with byte-for-byte unchanged stored analysis JSON. Invalid/missing-language/blank/extra-field/type payloads are rejected by the bilingual schema. JSON/CSV regressions protect existing transfer behavior.

Vitest checks saved selection, derived German/English text, rule actions, legacy method labels, unchanged analysis and no fetch. Playwright switches DE→EN→DE for rules, legacy LLM and saved bilingual model fixtures on desktop/mobile, asserting displayed wording, stable original content/provenance/classification, unchanged stored API data and **zero API requests after initial load**. Backend/browser transport guards continue blocking external traffic.

Executed results and limitations: `docs/testing/ANALYSIS_LANGUAGE_QA.md`. In the interview distinguish saved bilingual model wording from local classification descriptions; show the source notice and original-evidence disclosure rather than claiming old free text was translated.
