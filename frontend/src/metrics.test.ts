import { describe, it, expect } from "vitest";
import { calculateMetrics } from "./metrics";
import type { Mention } from "./api";

describe("dashboard metrics", () => {
  it("handles empty data", () => {
    expect(calculateMetrics([]).total).toBe(0);
    expect(calculateMetrics([]).actionRequired).toBe(0);
  });
  it("calculates values exclusively from stored mentions", () => {
    const mention: Mention = {
      id: 1, brand: "Aurora", content: "Help", platform: "Fictional",
      published_at: "2026-10-14T10:00:00Z", source_url: null, is_sample: true,
      analysis: {
        relevant: true, sentiment: "negative", topic: "support", action_required: true,
        priority: "high", summary: "Help", explanation: "Rule-based", suggested_action: "Respond",
        method: "deterministic", model_name: null,
      },
    };
    const m = calculateMetrics([mention]);
    expect(m.counts.negative).toBe(1);
    expect(m.actionRequired).toBe(1);
    expect(m.topics.support).toBe(1);
  });
});
