import { describe, expect, it, vi } from "vitest";
import { analysisText } from "./analysisText";
import type { MentionAnalysis } from "./api";

const legacy: MentionAnalysis = {
  relevant: true, sentiment: "negative", priority: "high", action_required: true,
  topic: "support", summary: "Original English summary.", explanation: "Original English explanation.",
  suggested_action: "Review the support complaint and respond with a next step.",
  method: "deterministic", model_name: null,
};

describe("analysis language selection without inference", () => {
  it("renders legacy rule explanations and actions in both languages without changing data", () => {
    const before = structuredClone(legacy);
    const de = analysisText(legacy, "de");
    const en = analysisText(legacy, "en");
    expect(de.summary).toBe("Stimmung: negativ. Markenbezug: Ja. Priorität: hoch.");
    expect(de.explanation).toContain("englischen Schlüsselwortregeln");
    expect(de.suggested_action).toContain("Prüfen Sie die Supportbeschwerde");
    expect(en.explanation).toContain("English keyword rules");
    expect(en.suggested_action).toContain("Review the support complaint");
    expect(de.source).toBe("derived");
    expect(legacy).toEqual(before);
    const question = { ...legacy, suggested_action: "Answer the user's question or provide a relevant resource." };
    expect(analysisText(question, "de").suggested_action).toContain("Beantworten Sie die Frage");
  });

  it("selects saved model translations immediately and makes no requests", () => {
    const fetch = vi.spyOn(globalThis, "fetch");
    const analysis = { ...legacy, method: "llm" as const, model_name: "original-model", localized_text: {
      de: { summary: "Supportbeschwerde", explanation: "Defekt gemeldet.", suggested_action: "Defekt prüfen." },
      en: { summary: "Support complaint", explanation: "Defect reported.", suggested_action: "Review defect." },
    }};
    const before = structuredClone(analysis);
    expect(analysisText(analysis, "de").explanation).toBe("Defekt gemeldet.");
    expect(analysisText(analysis, "en").explanation).toBe("Defect reported.");
    expect(analysisText(analysis, "de").source).toBe("stored");
    expect(analysis).toEqual(before);
    expect(fetch).not.toHaveBeenCalled();
    fetch.mockRestore();
  });

  it("labels old LLM/human descriptions honestly and never disguises them as a translation", () => {
    expect(analysisText({ ...legacy, method: "llm" }, "de").explanation).toContain("übersetzt nicht");
    expect(analysisText({ ...legacy, method: "human" }, "en").explanation).toContain("stored human classification");
    expect(analysisText({ ...legacy, action_required: false }, "de").suggested_action).toBeNull();
  });

  it("localizes the exact legacy fallback marker without treating arbitrary prose as provenance", () => {
    const failed = { ...legacy, explanation: legacy.explanation + " Gemini analysis was unavailable or invalid (timeout); fallback used." };
    expect(analysisText(failed, "de").explanation).toContain("Gemini war nicht verfügbar");
    expect(analysisText({ ...failed, method: "llm" }, "de").explanation).not.toContain("Ersatzanalyse wurde verwendet");
    expect(analysisText(legacy, "de").explanation).not.toContain("Gemini war nicht verfügbar");
  });
});
