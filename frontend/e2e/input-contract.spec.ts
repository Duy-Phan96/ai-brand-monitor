import { readFile } from "node:fs/promises";
import { test, expect } from "./fixtures";

const sample = (content: string, published_at = "2026-10-14T12:00:00Z") => ({
  brand: "Aurora", content, platform: "Fictional forum", published_at,
  source_url: null, is_sample: true,
});

test.beforeEach(async ({ request }) => {
  expect((await request.post("http://127.0.0.1:8011/__test/reset")).ok()).toBeTruthy();
});

test("downloaded JSON reimports unchanged with new IDs and fresh analysis", async ({ page, request }) => {
  const created = await request.post("/api/mentions", {
    data: sample("Aurora headphones are fantastic."),
  });
  expect(created.status()).toBe(201);
  const original = await created.json();
  await page.goto("/");
  await page.getByRole("button", { name: "Import & export", exact: true }).click();
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON" }).click();
  const download = await downloadEvent;
  const path = (await download.path())!;
  expect(JSON.parse(await readFile(path, "utf8")).mentions).toEqual([original]);
  await page.getByLabel("Select sample JSON file").setInputFiles(path);
  await expect(page.getByText("Imported 1 fictional sample mention.")).toBeVisible();
  await expect(page.getByTestId("mention-record")).toHaveCount(2);
  const stored = await (await request.get("/api/mentions")).json();
  expect(new Set(stored.map((m: any) => m.id)).size).toBe(2);
  expect(stored.some((m: any) => m.id === original.id)).toBeTruthy();
  expect(stored.some((m: any) => m.id > original.id)).toBeTruthy();
  expect(stored.every((m: any) => m.analysis.method === "deterministic")).toBeTruthy();
  expect(stored.every((m: any) => m.content === original.content)).toBeTruthy();
});

for (const timezoneId of ["Europe/Berlin", "America/Los_Angeles"]) {
  test.describe(`UTC contract in ${timezoneId}`, () => {
    test.use({ timezoneId });
    test("normalized timestamps keep activity, filtering and sorting consistent", async ({ page, request }) => {
      for (const [content, date] of [
        ["Aurora headphones are fantastic. Earlier UTC.", "2026-10-14T00:30:00+02:00"],
        ["Aurora headphones are comfortable. Later UTC.", "2026-10-13T16:00:00-07:00"],
      ]) {
        expect((await request.post("/api/mentions", { data: sample(content, date) })).status()).toBe(201);
      }
      const stored = await (await request.get("/api/mentions")).json();
      expect(stored.map((m: any) => m.published_at)).toEqual([
        "2026-10-13T23:00:00Z", "2026-10-13T22:30:00Z",
      ]);
      await page.goto("/");
      await expect(page.getByTestId("mention-record").first()).toContainText("Later UTC");
      await expect(page.getByRole("img", { name: /Daily mention activity/ })).toHaveAttribute("aria-label", /13\/10\/2026: 2/);
      await page.getByRole("button", { name: "Filters & sorting" }).click();
      await page.getByLabel("From", { exact: true }).fill("2026-10-13");
      await page.getByLabel("To", { exact: true }).fill("2026-10-13");
      await expect(page.getByTestId("mention-record")).toHaveCount(2);
      await page.getByRole("combobox", { name: "Sort", exact: true }).click();
      await page.getByRole("option", { name: "Oldest first", exact: true }).click();
      await expect(page.getByTestId("mention-record").first()).toContainText("Earlier UTC");
      await page.getByLabel("From", { exact: true }).fill("2026-10-14");
      await page.getByLabel("To", { exact: true }).fill("2026-10-14");
      await expect(page.getByTestId("mention-record")).toHaveCount(0);
    });
  });
}
