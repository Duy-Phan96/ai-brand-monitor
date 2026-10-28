import { describe, expect, it } from "vitest";
import i18n from "./index";
import { topicLabel } from "./topics";

describe("topic display localization", () => {
  const topics = ["product feedback", "unrelated", "support", "general"];

  it.each([
    ["de", ["Produktfeedback", "Nicht relevant", "Kundenservice", "Allgemein"]],
    ["en", topics],
  ] as const)("translates every predefined topic in %s", (language, labels) => {
    expect(topics.map(topic => topicLabel(topic, i18n.getFixedT(language)))).toEqual(labels);
  });

  it.each(["de", "en"])("preserves unknown topics exactly in %s", language => {
    for (const topic of ["Battery life", "topicSupport", "support.issue", "constructor", "__proto__", "", " Support "]) {
      expect(topicLabel(topic, i18n.getFixedT(language))).toBe(topic);
    }
  });
});
