# ADR 0011 - Bundled German/English frontend localization

## Follow-up — 2026-10-20
ADR 0013 extends the original interface-only scope: saved bilingual model text follows the UI language; older/rule analyses use explicitly labeled local classification descriptions. Original content/analysis and provenance remain unchanged. No inference or API request occurs on switching. The source-data display boundary below records the original milestone and is superseded for displayed analysis wording.

## Context

Follow-up (2026-10-28): predefined topics now use `frontend/src/i18n/topics.ts` and bundled catalogs, superseding the untranslated-topic display boundary below. Exact matching preserves identifiers; unknown provider topics remain verbatim. Only labels change; option values, React keys, comparisons and storage remain language-independent. An explicit allowlist prevents arbitrary provider strings from becoming translation keys. No backend translation, migration or model call. See `docs/testing/TOPIC_LOCALIZATION_QA.md`.
The ATZ interview needs a natural German business interface while preserving the original English interface and demonstrable engineering behavior. UI labels, errors and accessibility text must switch without discarding filters, drafts or expanded workflows.

## Alternatives
- A custom translation context: smaller initial footprint, but custom plural/missing-key machinery and greater maintenance burden.
- Runtime translation services: would send data externally, add cost/privacy/availability risks and change source meaning; rejected.
- i18next with react-i18next and bundled local JSON catalogs: selected. No HTTP translation backend or language-detection plugin is required for two supported languages.

## Decision
`frontend/src/i18n/index.ts` initializes the catalog before React renders. A valid `ai-brand-monitor.language` preference in localStorage wins over the primary browser language; German regional preferences map to de, all other primary preferences fall back to en. Changes update document lang and the stored preference. Storage exceptions are caught so switching remains available in memory. No cross-tab synchronization or server-side preference is implemented.

The header switch uses accessible exclusive MUI toggle buttons. React components subscribe to language changes, but retain their existing state and stable record identifiers; no provider-language key remounts the application. Locale-aware Intl helpers format dates in UTC and numbers. i18next plural forms choose grammar using the raw count while formatted count strings handle presentation.

Labels/enums are localized without changing API values. Mention content, platform/topic metadata, stored summaries, explanations and suggested actions remain source data; localization never rewrites stored analysis or translates imported text. The untouched manual-entry default is localized for display, but retains its original canonical API value; once a user edits that field, their exact text is preserved through switches.

Errors retain stable message keys/status or exception objects until render, rather than translated strings in state. Typed UIError categories avoid brittle text lookup for validation/HTTP failures and never expose response bodies. Native form validity is localized and reset on language changes/input. Import success retains a numeric count for language-aware rendering. Human analysis is labeled independently from LLM inference.

## UI and accessibility
Long German labels wrap; the existing MD3-inspired design and API contracts remain intact. The DE/EN switch is available on desktop/mobile, has explicit translated accessibility labels and keyboard behavior, and changes document language. An initial axe check found the default unselected toggle color at 4.48:1; explicit text/selected tonal colors corrected it. Text values derived from stored data are intentionally not interface translations.

## Trade-offs
Bundled catalogs add to the frontend bundle, but avoid network/cost and are versioned with the code. The current build is roughly 497 kB minified / 156 kB gzip for its main JS chunk; this is not a user-performance benchmark. Only en/de are supported. UTC charts stay consistent; locale does not change the timezone. Browser validation bubbles remain browser-rendered even though their message is localized. Date-picker chrome and file-picker dialogs follow the browser/OS language; the app cannot replace their native chrome without adding custom controls.

## Verification and explanation
Catalog key/interpolation parity, locale rules, formatting and safe errors are covered by unit tests. Browser coverage proves en/de detection, preference persistence after reload, state retention, storage denial, source-text preservation, native validation, retained-error translation, responsive widths and axe checks. All automated API analysis is deterministic and isolated; no live Gemini or translation requests.

For the interview, switch the UI with a populated filter and draft; show that source content and stored provenance do not change. Separate interface localization from translating customer content or claiming multilingual classifier accuracy. See LOCALIZATION_QA.md for actual results.
