import type { Mention } from "./api";
export const sentiments = ["positive", "negative", "neutral", "mixed"] as const;

export function calculateMetrics(mentions: Mention[]) {
  const counts = Object.fromEntries(sentiments.map((s) => [s, 0])) as Record<
    (typeof sentiments)[number],
    number
  >;
  const topics: Record<string, number> = {};
  const activity: Record<string, number> = {};
  let actionRequired = 0;
  for (const mention of mentions) {
    if (mention.analysis?.sentiment) counts[mention.analysis.sentiment] += 1;
    if (mention.analysis?.action_required) actionRequired += 1;
    if (mention.analysis?.topic)
      topics[mention.analysis.topic] =
        (topics[mention.analysis.topic] ?? 0) + 1;
    const day = new Date(mention.published_at).toISOString().slice(0, 10);
    activity[day] = (activity[day] ?? 0) + 1;
  }
  return { total: mentions.length, counts, actionRequired, topics, activity };
}
