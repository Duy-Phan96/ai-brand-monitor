import type { AnalysisText, MentionAnalysis } from "./api";
import i18n from "./i18n";

/** Select saved wording, or explicitly describe legacy classifications locally.
 * No translation request, inference, persistence change or source-text rewrite.
 */
export function analysisText(
  analysis: MentionAnalysis,
  language: string,
): AnalysisText & { source: "stored" | "derived" } {
  const locale = language.startsWith("de") ? "de" : "en";
  const stored = analysis.localized_text?.[locale];
  if (stored) return { ...stored, source: "stored" };

  const t = i18n.getFixedT(locale);
  const facts = {
    sentiment: t(analysis.sentiment),
    relevance: t(analysis.relevant ? "yes" : "no"),
    priority: t(analysis.priority),
  };
  // Only recognize the exact historical adapter marker; arbitrary model prose
  // must not be interpreted as authoritative metadata.
  const fallback = analysis.method === "deterministic" &&
    / Gemini analysis was unavailable or invalid \((timeout|http_error|transport_error|invalid_response_or_configuration)\); fallback used\.$/.test(analysis.explanation);
  return {
    summary: t("analysisSummary", facts),
    explanation: [
      t(analysis.method === "deterministic" ? "analysisRules" : analysis.method === "human" ? "analysisHuman" : "analysisLegacyLlm"),
      t(analysis.action_required ? "analysisNeedsAction" : "analysisNoAction"),
      fallback ? t("analysisFallback") : "",
    ].filter(Boolean).join(" "),
    suggested_action: analysis.action_required
      ? t(analysis.method === "deterministic" && analysis.suggested_action === "Review the support complaint and respond with a next step."
        ? "analysisSupportAction"
        : analysis.method === "deterministic" && analysis.suggested_action === "Answer the user's question or provide a relevant resource."
          ? "analysisQuestionAction" : "analysisReviewAction")
      : null,
    source: "derived",
  };
}
