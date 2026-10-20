import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useTranslation } from "react-i18next";
export function LanguageSwitch() {
  const { t, i18n } = useTranslation();
  return (
    <ToggleButtonGroup
      size="small"
      exclusive
      value={i18n.language}
      aria-label={t("language")}
      onChange={(_, value) => {
        if (value) void i18n.changeLanguage(value);
      }}
    >
      <ToggleButton
        value="de"
        aria-label={t("languageDe")}
        sx={{
          minHeight: 44,
          color: "text.primary",
          "&.Mui-selected": { color: "primary.dark", bgcolor: "primary.light" },
        }}
      >
        DE
      </ToggleButton>
      <ToggleButton
        value="en"
        aria-label={t("languageEn")}
        sx={{
          minHeight: 44,
          color: "text.primary",
          "&.Mui-selected": { color: "primary.dark", bgcolor: "primary.light" },
        }}
      >
        EN
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
