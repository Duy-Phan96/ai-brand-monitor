import AxeBuilder from "@axe-core/playwright";
import { type APIRequestContext } from "@playwright/test";
import { test, expect } from "./fixtures";
import { readFile } from "node:fs/promises";

const positive = "Aurora headphones are fantastic and comfortable.";
const negative =
  "Aurora headphones are broken. Support left my refund unanswered.";
const sample = (content: string, platform = "Forum") => ({
  brand: "Aurora",
  content,
  platform,
  published_at: "2026-10-14T12:00:00Z",
  source_url: null,
  is_sample: true,
});

test.beforeEach(async ({ request }) => {
  expect(
    (await request.post("http://127.0.0.1:8011/__test/reset")).ok(),
  ).toBeTruthy();
});

async function seed(request: APIRequestContext) {
  for (const content of [positive, negative]) {
    const response = await request.post("/api/mentions", {
      data: sample(content),
    });
    expect(response.status()).toBe(201);
    expect((await response.json()).analysis.method).toBe("deterministic");
  }
}

test("stored metrics, combined filters, details and responsive layout", async ({
  page,
  request,
}) => {
  await seed(request);
  const stored = await (await request.get("/api/mentions")).json();
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Monitoring overview" }),
  ).toBeVisible();
  for (const [label, count] of [
    ["Mentions", stored.length],
    [
      "Positive",
      stored.filter((m: any) => m.analysis.sentiment === "positive").length,
    ],
    [
      "Negative",
      stored.filter((m: any) => m.analysis.sentiment === "negative").length,
    ],
    [
      "Needs attention",
      stored.filter((m: any) => m.analysis.action_required).length,
    ],
  ] as const) {
    await expect(
      page.getByTestId(`metric-${label}`).getByTestId("metric-value"),
    ).toHaveText(String(count));
  }
  await expect(page.getByTestId("mention-record")).toHaveCount(2);
  await page.getByRole("textbox", { name: "Search mentions" }).fill("refund");
  await page.getByRole("button", { name: "Filters & sorting" }).click();
  await page.getByRole("combobox", { name: "Sentiment", exact: true }).click();
  await page.getByRole("option", { name: "negative", exact: true }).click();
  for (const [name, value] of [
    ["Platform", "Forum"],
    ["Topic", "support"],
    ["Priority", "high"],
  ]) {
    await page.getByRole("combobox", { name, exact: true }).click();
    await page.getByRole("option", { name: value, exact: true }).click();
  }
  await page.getByLabel("From", { exact: true }).fill("2026-10-14");
  await page.getByLabel("To", { exact: true }).fill("2026-10-14");
  await page.getByRole("checkbox", { name: "Needs attention" }).check();
  await expect(page.getByTestId("mention-record")).toHaveCount(1);
  await page.getByRole("button", { name: "View analysis" }).click();
  const record = page.getByTestId("mention-record");
  await expect(record).toContainText("Sentiment: negative");
  await expect(record).toContainText("Priority: high");
  await record.getByRole("button", { name: "How this was analyzed" }).click();
  await expect(record).toContainText("Method: deterministic");
  await expect(record).toContainText("No original source link");
  await page.getByRole("button", { name: "Hide details" }).click();
  await page
    .getByRole("textbox", { name: "Search mentions" })
    .fill("no-match-xyz");
  await expect(
    page.getByText("No mentions match the current filters.", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reset filters" }).click();
  await expect(page.getByTestId("mention-record")).toHaveCount(2);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: test.info().outputPath("dashboard.png"),
    fullPage: true,
  });
  for (const width of [320, 768]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      `Overflow at ${width}px`,
    ).toBeTruthy();
  }
});

test("create, JSON import and downloaded JSON/CSV match storage", async ({
  page,
  request,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Add mention", exact: true }).click();
  await page.getByRole("textbox", { name: "Mention content" }).fill(positive);
  expect(
    await page.locator("form :invalid").evaluateAll((elements) =>
      elements.map((e) => ({
        name: e.getAttribute("name"),
        tag: e.tagName,
        label: e.getAttribute("aria-label"),
        value: (e as HTMLInputElement).value,
      })),
    ),
  ).toEqual([]);
  await page.getByRole("button", { name: "Add sample mention" }).click();
  await expect(page.getByTestId("mention-record")).toHaveCount(1);
  await expect(page.getByTestId("mention-record")).toContainText(positive);
  await expect(
    page.getByText("Fictional mention added and analyzed."),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Import & export", exact: true })
    .click();
  await page.getByLabel("Select sample JSON file").setInputFiles({
    name: "sample.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({ mentions: [sample(negative)] })),
  });
  await expect(page.getByTestId("mention-record")).toHaveCount(2);
  await expect(
    page.getByText("Imported 1 fictional sample mention."),
  ).toBeVisible();
  const stored = await (await request.get("/api/mentions")).json();
  for (const format of ["JSON", "CSV"]) {
    const promise = page.waitForEvent("download");
    await page.getByRole("button", { name: `Export ${format}` }).click();
    const download = await promise;
    expect(download.suggestedFilename()).toBe(
      `mentions.${format.toLowerCase()}`,
    );
    const content = await readFile((await download.path())!, "utf8");
    if (format === "JSON") expect(JSON.parse(content).mentions).toEqual(stored);
    else {
      expect(content).toContain("method,model_name");
      expect(content).toContain(positive);
      expect(content).toContain(negative);
      expect(content.split("\n").filter(Boolean)).toHaveLength(3);
    }
  }
  expect(
    stored.every((m: any) => m.analysis.method === "deterministic"),
  ).toBeTruthy();
});

test("loading, HTTP error, retry and empty database states", async ({
  page,
}) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/api/mentions", async (route) => {
    await gate;
    await route.fulfill({ status: 503, body: "unavailable" });
  });
  await page.goto("/");
  await expect(
    page.getByRole("progressbar", { name: "Loading mentions" }),
  ).toBeVisible();
  release();
  await expect(
    page.getByRole("alert").filter({ hasText: "Unable to load dashboard" }),
  ).toContainText("API returned 503");
  await page.unroute("**/api/mentions");
  await page.getByRole("button", { name: "Retry" }).click();
  await expect(
    page.getByTestId("metric-Mentions").getByTestId("metric-value"),
  ).toHaveText("0");
  await expect(page.getByText("No activity to display.")).toBeVisible();
  await expect(page.getByTestId("mention-record")).toHaveCount(0);
});

test("creation and import failures retain stored data", async ({
  page,
  request,
}) => {
  await page.goto("/");
  await page.route("**/api/mentions", (route) =>
    route.request().method() === "POST"
      ? route.fulfill({ status: 500, body: "failed" })
      : route.continue(),
  );
  await page.getByRole("button", { name: "Add mention", exact: true }).click();
  await page.getByRole("textbox", { name: "Mention content" }).fill(positive);
  expect(
    await page.locator("form :invalid").evaluateAll((elements) =>
      elements.map((e) => ({
        name: e.getAttribute("name"),
        tag: e.tagName,
        label: e.getAttribute("aria-label"),
        value: (e as HTMLInputElement).value,
      })),
    ),
  ).toEqual([]);
  await page.getByRole("button", { name: "Add sample mention" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Unable to create mention" }),
  ).toContainText("HTTP 500");
  await page
    .getByRole("button", { name: "Import & export", exact: true })
    .click();
  await page.getByLabel("Select sample JSON file").setInputFiles({
    name: "invalid.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"mentions":[]}'),
  });
  await expect(
    page.getByText(/Include 1.*500 valid fictional sample mentions/),
  ).toBeVisible();
  expect(await (await request.get("/api/mentions")).json()).toEqual([]);
});

test("attention triage, keyboard disclosure and automated accessibility", async ({
  page,
  request,
}) => {
  await seed(request);
  await page.goto("/");
  await expect(page.getByTestId("mention-record")).toHaveCount(2);
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to main content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
  await page.getByRole("button", { name: "Review attention queue" }).click();
  await expect(page.getByTestId("mention-record")).toHaveCount(1);
  const disclosure = page.getByRole("button", { name: "View analysis" });
  await disclosure.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("region", { name: /Analysis of Aurora/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "How this was analyzed" }).click();
  await page.getByRole("button", { name: "Add mention", exact: true }).click();
  await page
    .getByRole("button", { name: "Import & export", exact: true })
    .click();
  await page.getByRole("button", { name: "Filters & sorting" }).click();
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(result.violations).toEqual([]);
  await page.screenshot({
    path: test.info().outputPath("expanded-dashboard.png"),
    fullPage: true,
  });
});

test("mocked LLM provenance remains distinct from deterministic analysis", async ({
  page,
  request,
}) => {
  await seed(request);
  const stored = await (await request.get("/api/mentions")).json();
  const positiveRecord = stored.find(
    (m: any) => m.analysis.sentiment === "positive",
  );
  positiveRecord.analysis.method = "llm";
  positiveRecord.analysis.model_name = "gemini-3.1-flash-lite";
  await page.route("**/api/mentions", (route) =>
    route.fulfill({ json: stored }),
  );
  await page.goto("/");
  const llm = page.getByTestId("mention-record").filter({ hasText: positive });
  const rules = page
    .getByTestId("mention-record")
    .filter({ hasText: negative });
  await expect(llm).toContainText("LLM inference");
  await expect(rules).toContainText("Deterministic rules");
  await llm.getByRole("button", { name: "View analysis" }).click();
  await llm.getByRole("button", { name: "How this was analyzed" }).click();
  await expect(llm).toContainText("Method: llm (gemini-3.1-flash-lite)");
  await expect(llm).toContainText(
    "AI-generated analysis requires human review.",
  );
});
