import { UIError } from "../errors";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import de from "./locales/de.json";

export const languageStorageKey = "ai-brand-monitor.language";
export function selectLanguage(
  saved: string | null,
  browserLanguages: readonly string[],
): "en" | "de" {
  if (saved === "en" || saved === "de") return saved;
  return browserLanguages[0]?.toLowerCase().startsWith("de") ? "de" : "en";
}
let saved: string | null = null;
try {
  saved = localStorage.getItem(languageStorageKey);
} catch {
  /* Storage may be restricted. */
}
const language = selectLanguage(
  saved,
  typeof navigator !== "undefined" ? navigator.languages : ["en"],
);
void i18n
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, de: { translation: de } },
    lng: language,
    fallbackLng: "en",
    supportedLngs: ["en", "de"],
    interpolation: { escapeValue: false },
    initAsync: false,
  });
function applyLanguage(language: string) {
  if (typeof document !== "undefined") document.documentElement.lang = language;
  try {
    localStorage.setItem(languageStorageKey, language);
  } catch {
    /* Switching still works in memory. */
  }
}
i18n.on("languageChanged", applyLanguage);
applyLanguage(language);
export function formatNumber(value: number) {
  return new Intl.NumberFormat(i18n.language).format(value);
}
export function formatDate(value: string) {
  return new Intl.DateTimeFormat(i18n.language === "de" ? "de-DE" : "en-GB", {
    timeZone: "UTC",
  }).format(new Date(value));
}
export function errorMessage(error: unknown): string {
  if (error instanceof UIError)
    return i18n.t(error.key, { status: error.status });
  if (error instanceof SyntaxError) return i18n.t("invalidJson");
  if (error instanceof TypeError) return i18n.t("network");
  const message = error instanceof Error ? error.message : "";
  const patterns: [RegExp, string][] = [
    [/^API returned (\d+)$/, "apiError"],
    [/^Unable to create mention \(HTTP (\d+)\)$/, "createHttp"],
    [/^Import rejected \(HTTP (\d+)\)/, "importHttp"],
    [/^Export failed \(HTTP (\d+)\)$/, "exportHttp"],
  ];
  for (const [pattern, key] of patterns) {
    const match = message.match(pattern);
    if (match) return i18n.t(key, { status: match[1] });
  }
  const messages: Record<string, string> = {
    "File must be 1 MB or smaller.": "fileSize",
    'Expected an object with a "mentions" array.': "importShape",
    "Include 1–500 valid fictional sample mentions.": "importRecords",
    "Import failed": "importFailed",
    "Export failed": "exportFailed",
    "Unable to add mention": "createFailed",
    "Failed to load mentions": "loadFailed",
  };
  return i18n.t(messages[message] ?? "network");
}
export default i18n;
