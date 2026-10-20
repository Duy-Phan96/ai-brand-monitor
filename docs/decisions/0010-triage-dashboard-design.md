# ADR 0010 - Triage-first Material Design 3 inspired dashboard

## Problem and observed weaknesses
The functional MVP put large creation/import forms before mentions, delaying review. Default MUI surfaces had little hierarchy and no navigation. Sentiment counts were plain lists, activity was expressed as percentage progress, and the detail view mixed recommendations with technical provenance. Filters occupied a dense row with no visible active-filter feedback. Labels separated sentiment and priority incompletely, and the page lacked a skip link and landmark navigation.

## Alternatives
- A full charting/design-system dependency: richer visualization, but unnecessary bundle/API complexity for the small dataset.
- Multi-route views and modal editing: cleaner individual pages, but new routing/state complexity and a larger regression surface.
- A restrained single-page triage workspace using existing MUI and native SVG/CSS: selected.

## Decision and implementation
Use a fixed desktop navigation rail and compact mobile navigation to real section anchors. Put KPIs, activity, sentiment, topics and action triage first; move fictional entry/import/export to expandable Data tools. Keep filter search visible and advanced filtering in an accordion, with a visible active count and attention-queue chip. A one-click attention queue resets unrelated filters and sorts by urgency.

The light theme uses explicit semantic tones, a soft surface container, dark teal primary action color, restrained borders, 16px surfaces and pill buttons. Type roles, 8px-based spacing, tonal attention surfaces and progressive disclosure follow MD3 principles. MUI 6 components are themed; this is MD3-inspired, not a claim of strict Material 3 compliance. Automatic dark mode was removed to avoid an unverified palette; dark mode remains future work.

Activity uses actual daily counts rather than percent-of-all progress. Native SVG provides an accessible text equivalent and expandable daily counts. Sentiment bars show counts and percentages among analyzed records, explicitly identifying unanalysed records. Topics and high/critical attention counts are derived solely from stored data. No invented trends, score or comparison period. UTC grouping/filtering and chronological sorting were corrected for timezone offsets, with regression coverage.

Details show summary, sentiment, priority and next step first. Row labels distinguish LLM inference, deterministic rules and human analysis; expanded provenance discloses exact method/model/explanation. Deterministic mode is not automatically called a provider failure: failure is identified only when the actual explanation says so. Source-link handling and fictional labels are preserved.

## Accessibility
Text labels supplement colors, logical headings/landmarks and a keyboard skip link support navigation, focus-visible outlines are explicit, and buttons have a minimum 44px height. Disclosure controls expose expanded state/controlled regions; errors retain Retry and refreshed content remains mounted. Accordion transitions are disabled, avoiding unnecessary movement and a moving-target interaction race seen in the first browser run. Chart data has text equivalents. Positive/negative sentiment colors remain distinct from priority labels.

The automated axe-core WCAG 2.0/2.1 A/AA scans found zero violations in the tested expanded desktop/mobile states. Keyboard tests verify skip link, main focus and Enter activation of analysis disclosure. This is not a full WCAG conformance audit: screen-reader workflows, all transient states, zoom and real devices still need manual review.

## Engineering and trade-offs
Split overview visualizations and mention details from App into DashboardInsights and MentionList; theme tokens live in theme.ts. Existing form/transfer/API components and API contracts are retained. No runtime dependency was added. @axe-core/playwright is development-only and justified for repeatable accessibility regression checks. Prettier was used transiently to format the changed components; it was not added to the project dependency graph.

The single-page architecture still loads all records and aggregates locally. Anchor navigation does not implement route history or scroll-position-driven active state. Large date-series labels, large lists, long unbroken user content, concurrency and advanced analytics remain future work. Source content is still rendered as text. User data, local credentials and production infrastructure are untouched.

## Verification and interview explanation
Backend 39 tests pass; frontend 10 tests pass, including new UTC grouping/filter/sort regressions; production build passes. Twelve browser cases cover original workflow plus attention triage, keyboard interactions and automated accessibility on desktop/mobile, including a mocked LLM-versus-rules provenance check. Horizontal overflow checks at 320, 390, 768 and 1440 widths pass; full-page screenshots were visually inspected. npm audit reports zero. Browser tests use isolated SQLite, deterministic mode and blocked external API traffic; no live Gemini requests were made.

Explain the visual ordering as an operator decision flow: overview -> attention queue -> context -> suggested action -> provenance. State that all screenshots use two clearly fictional records persisted through the test API; the single-day chart does not imply a trend. Separately describe the previously verified service-level Gemini response. This redesign is not production deployment or proof of classifier accuracy.
