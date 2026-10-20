import { describe, expect, it } from "vitest";
import i18n, {
  errorMessage,
  formatDate,
  formatNumber,
  selectLanguage,
} from "./index";
import en from "./locales/en.json";
import de from "./locales/de.json";

describe("bilingual catalog and preference rules", () => {
  it("has complete nonempty catalogs with matching interpolation variables", () => {
    expect(Object.keys(de).sort()).toEqual(Object.keys(en).sort());
    for (const key of Object.keys(en) as (keyof typeof en)[]) {
      expect(de[key].trim()).not.toBe("");
      expect(de[key].match(/{{\w+}}/g)?.sort()).toEqual(
        en[key].match(/{{\w+}}/g)?.sort(),
      );
    }
  });
  it("selects saved language before browser language and safely falls back", () => {
    expect(selectLanguage(null, ["de-AT", "en"])).toBe("de");
    expect(selectLanguage("en", ["de-DE"])).toBe("en");
    expect(selectLanguage("invalid", ["fr-FR"])).toBe("en");
  });
  it("formats UTC dates and numbers with the chosen locale", async () => {
    await i18n.changeLanguage("de");
    expect(formatNumber(1234)).toBe("1.234");
    expect(formatDate("2026-10-14T00:30:00+02:00")).toBe("13.10.2026");
    await i18n.changeLanguage("en");
    expect(formatNumber(1234)).toBe("1,234");
  });
  it("localizes retained error objects instead of exposing raw exception details", async () => {
    const error = new Error("Unable to create mention (HTTP 500)");
    await i18n.changeLanguage("de");
    expect(errorMessage(error)).toContain(
      "Erwähnung konnte nicht erstellt werden",
    );
    expect(errorMessage(new SyntaxError("internal details"))).toContain(
      "Ungültige JSON-Datei",
    );
    expect(
      errorMessage(new Error("sensitive unexpected message")),
    ).not.toContain("sensitive");
    await i18n.changeLanguage("en");
    expect(errorMessage(error)).toBe("Unable to create mention (HTTP 500)");
  });
});
