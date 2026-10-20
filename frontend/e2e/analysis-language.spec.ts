import { test, expect } from "./fixtures";

for (const kind of ["rules", "legacy-llm", "bilingual-model"] as const) {
  test(`${kind}: DE/EN analysis changes locally while original and provenance remain intact`, async ({ page, request }) => {
    expect((await request.post("http://127.0.0.1:8011/__test/reset")).ok()).toBeTruthy();
    const original = "Aurora headphones are broken. Support left my refund unanswered.";
    const created = await request.post("/api/mentions", { data: {
      brand: "Aurora", content: original, platform: "Fictional forum",
      published_at: "2026-10-20T12:00:00Z", source_url: null, is_sample: true,
    }});
    expect(created.status()).toBe(201);
    const persisted = await (await request.get("/api/mentions")).json();
    const displayed = structuredClone(persisted);
    if (kind !== "rules") {
      displayed[0].analysis.method = "llm";
      displayed[0].analysis.model_name = "mock-model-no-live-inference";
      delete displayed[0].analysis.localized_text;
    }
    if (kind === "bilingual-model") {
      displayed[0].analysis.localized_text = {
        de: { summary: "Supportbeschwerde zu defekten Kopfhörern.", explanation: "Ein Defekt und eine unbeantwortete Erstattung werden gemeldet.", suggested_action: "Kontaktieren Sie den Support zur Erstattung." },
        en: { summary: "Support complaint about broken headphones.", explanation: "A defect and an unanswered refund are reported.", suggested_action: "Contact support about the refund." },
      };
    }
    // Model/legacy UI fixtures are explicit mocks, never actual Gemini inference.
    if (kind !== "rules") await page.route("**/api/mentions", route => route.fulfill({ json: displayed }));
    await page.goto("/");
    await expect(page.getByTestId("mention-record")).toHaveCount(1);
    await page.getByRole("button", { name: "View analysis", exact: true }).click();
    await page.getByRole("button", { name: "How this was analyzed", exact: true }).click();
    const afterLoadApiRequests: string[] = [];
    page.on("request", r => {
      if (new URL(r.url()).pathname.startsWith("/api/")) afterLoadApiRequests.push(r.url());
    });
    for (const language of ["de", "en", "de"] as const) {
      await page.locator(`button[value="${language}"]`).click();
      const record = page.getByTestId("mention-record");
      await expect(record).toContainText(original);
      if (kind === "bilingual-model") {
        const text = displayed[0].analysis.localized_text[language];
        await expect(page.getByTestId("analysis-summary")).toHaveText(text.summary);
        await expect(page.getByTestId("analysis-explanation")).toHaveText(text.explanation);
        await expect(page.getByTestId("analysis-action")).toHaveText(text.suggested_action);
      } else {
        await expect(page.getByTestId("analysis-summary")).toContainText(language === "de" ? "Stimmung: negativ" : "Sentiment: negative");
        await expect(page.getByTestId("analysis-explanation")).toContainText(kind === "rules"
          ? (language === "de" ? "englischen Schlüsselwortregeln" : "English keyword rules")
          : (language === "de" ? "übersetzt nicht" : "does not translate"));
        await expect(page.getByTestId("analysis-action")).toContainText(language === "de" ? "Prüfen Sie" : "Review");
        await expect(record).toContainText(language === "de" ? "keine Übersetzung" : "not a translation");
      }
      await expect(record).toContainText(language === "de" ? "Priorität: hoch" : "Priority: high");
      await expect(record).toContainText(kind === "rules" ? (language === "de" ? "Deterministische Regeln" : "Deterministic rules") : "mock-model-no-live-inference");
    }
    expect(afterLoadApiRequests).toEqual([]);
    expect(await (await request.get("/api/mentions")).json()).toEqual(persisted);
    await page.getByText("Ursprüngliche Analyse anzeigen (unübersetzt)", { exact: true }).click();
    await expect(page.getByTestId("mention-record")).toContainText(displayed[0].analysis.explanation);
  });
}
