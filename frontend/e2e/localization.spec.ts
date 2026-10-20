import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "./fixtures";

const mention = "Aurora headphones are fantastic and comfortable.";
async function seed(request: any) {
  await request.post("http://127.0.0.1:8011/__test/reset");
  await request.post("/api/mentions", {
    data: {
      brand: "Aurora",
      content: mention,
      platform: "Forum",
      published_at: "2026-10-14T12:00:00Z",
      source_url: null,
      is_sample: true,
    },
  });
}
for (const language of ["en", "de"] as const) {
  test.describe(language, () => {
    test.use({ locale: language === "de" ? "de-DE" : "en-GB" });
    test("detects language, preserves data and passes responsive accessibility", async ({
      page,
      request,
    }) => {
      await seed(request);
      await page.goto("/");
      await expect(page.locator("html")).toHaveAttribute("lang", language);
      await expect(
        page.getByRole("heading", {
          name:
            language === "de" ? "Monitoring-Übersicht" : "Monitoring overview",
        }),
      ).toBeVisible();
      await expect(page.getByTestId("mention-record")).toContainText(mention);
      await expect(page.getByTestId("mention-record")).toContainText(
        language === "de" ? "Deterministische Regeln" : "Deterministic rules",
      );
      await expect(page.getByTestId("mention-record")).toContainText(
        language === "de" ? "14.10.2026" : "14/10/2026",
      );
      for (const width of [320, 390, 768, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
          `${language}: overflow ${width}`,
        ).toBeTruthy();
      }
      await page.setViewportSize(test.info().project.use.viewport!);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({
        path: test.info().outputPath(`dashboard-${language}.png`),
        fullPage: true,
      });
      await page
        .getByRole("button", {
          name: language === "de" ? "Analyse anzeigen" : "View analysis",
        })
        .click();
      await page
        .getByRole("button", {
          name:
            language === "de"
              ? "So wurde die Analyse erstellt"
              : "How this was analyzed",
        })
        .click();
      await page
        .getByRole("button", {
          name: language === "de" ? "Erwähnung hinzufügen" : "Add mention",
          exact: true,
        })
        .click();
      await page
        .getByRole("button", {
          name: language === "de" ? "Import und Export" : "Import & export",
          exact: true,
        })
        .click();
      await page
        .getByRole("button", {
          name:
            language === "de" ? "Filter und Sortierung" : "Filters & sorting",
        })
        .click();
      const checks = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      expect(checks.violations).toEqual([]);
      await page
        .getByLabel(
          language === "de"
            ? "JSON-Datei mit Beispieldaten auswählen"
            : "Select sample JSON file",
        )
        .setInputFiles({
          name: "bad.json",
          mimeType: "application/json",
          buffer: Buffer.from("not json"),
        });
      await expect(page.getByRole("alert")).toContainText(
        language === "de" ? "Ungültige JSON-Datei" : "Invalid JSON file",
      );
    });
  });
}

test.describe("state and persistence", () => {
  test.use({ locale: "de-DE" });
  test("switches without resetting filters, disclosure, input or retained errors", async ({
    page,
    request,
  }) => {
    await seed(request);
    await page.goto("/");
    await page
      .getByRole("textbox", { name: "Erwähnungen durchsuchen" })
      .fill("Aurora");
    await page.getByRole("button", { name: "Filter und Sortierung" }).click();
    await page.getByRole("combobox", { name: "Stimmung", exact: true }).click();
    await page.getByRole("option", { name: "positiv", exact: true }).click();
    await page.getByRole("button", { name: "Analyse anzeigen" }).click();
    await page
      .getByRole("button", { name: "Erwähnung hinzufügen", exact: true })
      .click();
    await page
      .getByRole("textbox", { name: "Inhalt der Erwähnung" })
      .fill("Fictional draft - keep this exact content.");
    await page
      .getByRole("textbox", { name: "Plattform", exact: true })
      .fill("My fictional forum");
    await page
      .getByRole("button", { name: "Import und Export", exact: true })
      .click();
    await page
      .getByLabel("JSON-Datei mit Beispieldaten auswählen")
      .setInputFiles({
        name: "bad.json",
        mimeType: "application/json",
        buffer: Buffer.from("not json"),
      });
    const switcher = page.locator('button[value="en"]');
    await switcher.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(
      page.getByRole("textbox", { name: "Search mentions" }),
    ).toHaveValue("Aurora");
    await expect(
      page.getByRole("combobox", { name: "Sentiment", exact: true }),
    ).toContainText("positive");
    await expect(
      page.getByRole("textbox", { name: "Mention content" }),
    ).toHaveValue("Fictional draft - keep this exact content.");
    await expect(
      page.getByRole("textbox", { name: "Platform", exact: true }),
    ).toHaveValue("My fictional forum");
    await expect(
      page.getByRole("button", { name: "Hide details" }),
    ).toBeVisible();
    await expect(page.getByRole("alert")).toContainText("Invalid JSON file");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    expect(
      await page.evaluate(() =>
        localStorage.getItem("ai-brand-monitor.language"),
      ),
    ).toBe("en");
  });
  test("keeps switching available when preference storage is denied", async ({
    page,
    request,
  }) => {
    await seed(request);
    await page.addInitScript(() => {
      Storage.prototype.getItem = () => {
        throw new Error("denied");
      };
      Storage.prototype.setItem = () => {
        throw new Error("denied");
      };
    });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "de");
    await page.locator('button[value="en"]').click();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });
});

test.describe("localized validation", () => {
  test.use({ locale: "de-DE" });
  test("localizes native validation and retained HTTP errors", async ({
    page,
    request,
  }) => {
    await seed(request);
    await page.goto("/");
    await page
      .getByRole("button", { name: "Erwähnung hinzufügen", exact: true })
      .click();
    await page
      .getByRole("textbox", { name: "Inhalt der Erwähnung" })
      .fill("Keep this fictional draft.");
    const url = page.getByRole("textbox", { name: "Quellen-URL (optional)" });
    await url.fill("invalid-url");
    await page
      .getByRole("button", { name: "Beispielerwähnung hinzufügen" })
      .click();
    expect(
      await url.evaluate((input: HTMLInputElement) => input.validationMessage),
    ).toContain("gültige URL");
    await page.locator('button[value="en"]').click();
    const englishUrl = page.getByRole("textbox", {
      name: "Source URL (optional)",
    });
    await page.getByRole("button", { name: "Add sample mention" }).click();
    expect(
      await englishUrl.evaluate(
        (input: HTMLInputElement) => input.validationMessage,
      ),
    ).toContain("valid URL");
    await page.route("**/api/mentions", (route) =>
      route.request().method() === "POST"
        ? route.fulfill({ status: 500, body: "not displayed" })
        : route.continue(),
    );
    await englishUrl.fill("");
    await page.getByRole("button", { name: "Add sample mention" }).click();
    await expect(page.getByRole("alert")).toContainText(
      "Unable to create mention (HTTP 500)",
    );
    await page.locator('button[value="de"]').click();
    await expect(page.getByRole("alert")).toContainText(
      "Erwähnung konnte nicht erstellt werden (HTTP 500)",
    );
    await expect(
      page.getByRole("textbox", { name: "Inhalt der Erwähnung" }),
    ).toHaveValue("Keep this fictional draft.");
  });
});
