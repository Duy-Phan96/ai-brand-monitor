import { useTranslation } from "react-i18next";
import { errorMessage } from "./i18n";
import { Alert, Button, Stack, TextField, Typography } from "@mui/material";
import { useState, useRef, useEffect } from "react";
import { createMention } from "./api";
interface Props {
  onCreated: () => Promise<void>;
}
export function MentionForm({ onCreated }: Props) {
  const { t, i18n } = useTranslation();
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    formRef.current
      ?.querySelectorAll<
        HTMLInputElement | HTMLTextAreaElement
      >("input, textarea")
      .forEach((field) => field.setCustomValidity(""));
  }, [i18n.language]);
  const [brand, setBrand] = useState("Aurora");
  const [platform, setPlatform] = useState("Manual entry");
  const [platformEdited, setPlatformEdited] = useState(false);
  const [content, setContent] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setSuccess(false);
    try {
      await createMention({
        brand: brand.trim(),
        platform: platform.trim(),
        content: content.trim(),
        source_url: sourceUrl.trim() || null,
        is_sample: true,
        published_at: new Date().toISOString(),
      });
      setContent("");
      setSourceUrl("");
      setSuccess(true);
      await onCreated();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause : new Error("Unable to add mention"),
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Stack
      ref={formRef}
      onInvalid={(e) => {
        const field = e.target as HTMLInputElement;
        field.setCustomValidity(
          t(
            field.validity.typeMismatch
              ? "validationUrl"
              : "validationRequired",
          ),
        );
      }}
      onInput={(e) => {
        const field = e.target as HTMLInputElement;
        if (typeof field.setCustomValidity === "function")
          field.setCustomValidity("");
      }}
      component="form"
      onSubmit={(e) => void submit(e)}
      spacing={2}
    >
      <Typography variant="body2" color="text.secondary">
        {t("formNote")}
      </Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField
          label={t("brand")}
          required
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          inputProps={{ maxLength: 120 }}
        />
        <TextField
          label={t("platform")}
          required
          value={platformEdited ? platform : t("manualEntry")}
          onChange={(e) => {
            setPlatformEdited(true);
            setPlatform(e.target.value);
          }}
          inputProps={{ maxLength: 80 }}
        />
      </Stack>
      <TextField
        label={t("content")}
        multiline
        minRows={3}
        required
        value={content}
        onChange={(e) => setContent(e.target.value)}
        inputProps={{ maxLength: 10000 }}
      />
      <TextField
        label={t("url")}
        type="url"
        value={sourceUrl}
        onChange={(e) => {
          e.target.setCustomValidity("");
          setSourceUrl(e.target.value);
        }}
        onInvalid={(e) =>
          (e.target as HTMLInputElement).setCustomValidity(t("validationUrl"))
        }
        placeholder="https://example.com/post"
      />
      {error && <Alert severity="error">{errorMessage(error)}</Alert>}
      {success && <Alert severity="success">{t("created")}</Alert>}
      <Button
        type="submit"
        variant="contained"
        disabled={busy || !brand.trim() || !platform.trim() || !content.trim()}
      >
        {busy ? t("saving") : t("submit")}
      </Button>
    </Stack>
  );
}
