import type { TFunction } from "i18next";

const topicKeys = {
  "product feedback": "topicProductFeedback",
  unrelated: "topicUnrelated",
  support: "topicSupport",
  general: "topicGeneral",
} as const;

/** Localize display only; identifiers and unknown provider topics stay intact. */
export function topicLabel(topic: string, t: TFunction): string {
  return Object.hasOwn(topicKeys, topic)
    ? t(topicKeys[topic as keyof typeof topicKeys])
    : topic;
}
