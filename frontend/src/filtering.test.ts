import { describe, expect, it } from "vitest";
import type { Mention } from "./api";
import { defaultFilters, filterMentions } from "./filtering";

const sample = (id: number, date: string, topic: string, priority: "low" | "high"): Mention => ({
  id, brand: "Aurora", content: id === 1 ? "Great headphones" : "Needs support",
  platform: id === 1 ? "Reviews" : "Forum", published_at: date, source_url: null, is_sample: true,
  analysis: {
    relevant: true, sentiment: id === 1 ? "positive" : "negative", topic,
    priority, action_required: id === 2, summary: "example", explanation: "rule",
    suggested_action: null, method: "deterministic", model_name: null,
  },
});
const mentions = [
  sample(1, "2026-10-10T09:00:00Z", "product", "low"),
  sample(2, "2026-10-12T09:00:00Z", "support", "high"),
];

describe("combined mention filtering", () => {
  it("sorts newest by default", () => {
    expect(filterMentions(mentions, defaultFilters).map(m => m.id)).toEqual([2, 1]);
  });
  it("combines topic, priority and attention", () => {
    expect(filterMentions(mentions, { ...defaultFilters, topic: "support", priority: "high", actionOnly: true }).map(m => m.id)).toEqual([2]);
  });
  it("includes date boundaries", () => {
    expect(filterMentions(mentions, { ...defaultFilters, from: "2026-10-10", to: "2026-10-10" }).map(m => m.id)).toEqual([1]);
  });
  it("supports case-insensitive text and other filters", () => {
    expect(filterMentions(mentions, { ...defaultFilters, search: "GREAT", platform: "Reviews", sentiment: "positive" }).map(m => m.id)).toEqual([1]);
  });
  it("supports oldest and priority sorting without changing the input", () => {
    expect(filterMentions(mentions, { ...defaultFilters, sort: "oldest" }).map(m => m.id)).toEqual([1, 2]);
    expect(filterMentions([...mentions].reverse(), { ...defaultFilters, sort: "priority" }).map(m => m.id)).toEqual([2, 1]);
    expect(mentions[0].id).toBe(1);
  });
});


it("uses UTC publication dates and chronological order across offsets", () => {
  const base = { brand: "Aurora", content: "Example", platform: "Sample", source_url: null, is_sample: true, analysis: null };
  const records = [
    { ...base, id: 1, published_at: "2026-10-14T00:30:00+02:00" },
    { ...base, id: 2, published_at: "2026-10-13T23:00:00Z" },
  ];
  expect(filterMentions(records, { ...defaultFilters, from: "2026-10-13", to: "2026-10-13", sort: "newest" }).map(m => m.id)).toEqual([2, 1]);
});
