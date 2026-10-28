import { test, expect } from "./fixtures";

test("topics localize across statistics, filters and details without requests or state loss", async ({ page, request }) => {
  expect((await request.post("http://127.0.0.1:8011/__test/reset")).ok()).toBeTruthy();
  const cases = [
    ["Aurora", "Aurora headphones are fantastic.", "product feedback", "Produktfeedback"],
    ["Aurora", "The aurora sky is beautiful.", "unrelated", "Nicht relevant"],
    ["Aurora", "Aurora support left my refund unanswered.", "support", "Kundenservice"],
    ["Example", "Example is here.", "general", "Allgemein"],
    ["Example", "Example has a custom topic.", "Battery life", "Battery life"],
  ];
  for (const [brand, content] of cases) {
    const result = await request.post("/api/mentions", { data: {
      brand, content, platform: "Fictional forum", published_at: "2026-10-28T12:00:00Z",
      source_url: null, is_sample: true,
    }});
    expect(result.status()).toBe(201);
  }
  const persisted = await (await request.get("/api/mentions")).json();
  const displayed = structuredClone(persisted);
  // Explicit provider-topic UI fixture; the real server data stays unchanged.
  displayed.find((m: { content: string }) => m.content === cases[4][1]).analysis.topic = "Battery life";
  await page.route("**/api/mentions", route => route.fulfill({ json: displayed }));
  await page.goto("/");
  await expect(page.getByTestId("mention-record")).toHaveCount(5);
  await page.getByRole("button", { name: "Filters & sorting", exact: true }).click();
  const requests: string[] = [];
  page.on("request", r => requests.push(r.url()));

  for (const [, content, topic, german] of cases) {
    const language = await page.locator("html").getAttribute("lang");
    const topicFilter = page.getByRole("combobox", { name: language === "de" ? "Thema" : "Topic", exact: true });
    await topicFilter.click();
    await page.getByRole("option", { name: language === "de" ? german : topic, exact: true }).click();
    await expect(page.getByTestId("mention-record")).toHaveCount(1);
    await expect(page.getByTestId("mention-record")).toContainText(content);
    await page.getByRole("button", { name: language === "de" ? "Analyse anzeigen" : "View analysis", exact: true }).click();

    for (const locale of ["de", "en", "de"] as const) {
      await page.locator(`button[value="${locale}"]`).click();
      const label = locale === "de" ? german : topic;
      await expect(page.getByRole("combobox", { name: locale === "de" ? "Thema" : "Topic", exact: true })).toHaveText(label);
      await expect(page.getByTestId("mention-record")).toHaveCount(1);
      await expect(page.getByTestId("mention-record")).toContainText(content);
      await expect(page.locator('[id^="mention-details-"]')).toContainText(`${locale === "de" ? "Thema:" : "Topic:"} ${label}`);
      const statistics = page.getByRole("heading", { name: locale === "de" ? "Häufigste Themen" : "Top discussed topics", exact: true }).locator("..");
      for (const [, , english, de] of cases) {
        await expect(statistics.getByText(new RegExp(`^0[1-5]${locale === "de" ? de : english}$`))).toBeVisible();
        if (locale === "de" && english !== de) await expect(statistics.getByText(new RegExp(`^0[1-5]${english}$`))).toHaveCount(0);
      }
      const filter = page.getByRole("combobox", { name: locale === "de" ? "Thema" : "Topic", exact: true });
      await filter.click();
      for (const [, , english, de] of cases) {
        await expect(page.getByRole("option", { name: locale === "de" ? de : english, exact: true })).toBeVisible();
        if (locale === "de" && english !== de) await expect(page.getByRole("option", { name: english, exact: true })).toHaveCount(0);
      }
      await page.keyboard.press("Escape");
    }
    await page.getByRole("button", { name: "Details schließen", exact: true }).click();
  }
  expect(requests).toEqual([]);
  expect(await (await request.get("/api/mentions")).json()).toEqual(persisted);
});
