import { UIError } from "./errors";
import { useTranslation } from "react-i18next";
import { formatNumber, errorMessage } from "./i18n";
import { Alert, Button, Stack, Typography } from "@mui/material";
import { useRef, useState } from "react";
interface Props {
  onImported: () => Promise<void>;
}
type SampleMention = {
  brand: string;
  content: string;
  platform: string;
  published_at: string;
  source_url: string | null;
  is_sample: true;
};
function isSampleMention(input: unknown): input is SampleMention {
  if (!input || typeof input !== "object") return false;
  const m = input as Record<string, unknown>;
  return (
    typeof m.brand === "string" &&
    m.brand.trim().length > 0 &&
    typeof m.content === "string" &&
    m.content.trim().length > 0 &&
    typeof m.platform === "string" &&
    m.platform.trim().length > 0 &&
    typeof m.published_at === "string" &&
    !Number.isNaN(Date.parse(m.published_at)) &&
    (m.source_url === null || typeof m.source_url === "string") &&
    m.is_sample === true
  );
}
export function MentionTransfer({ onImported }: Props) {
  const { t } = useTranslation();
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<number | null>(null);
  const [error, setError] = useState<Error | null>(null);
  async function importFile(file: File) {
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      if (file.size > 1000000) throw new UIError("fileSize");
      const parsed: unknown = JSON.parse(await file.text());
      if (!parsed || typeof parsed !== "object" || !("mentions" in parsed)) {
        throw new UIError("importShape");
      }
      const records = (
        parsed as {
          mentions: unknown;
        }
      ).mentions;
      if (
        !Array.isArray(records) ||
        records.length === 0 ||
        records.length > 500 ||
        !records.every(isSampleMention)
      ) {
        throw new UIError("importRecords");
      }
      const response = await fetch("/api/mentions/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentions: records }),
      });
      if (!response.ok) throw new UIError("importHttp", response.status);
      const result = (await response.json()) as {
        imported: number;
      };
      setMessage(result.imported);
      await onImported();
    } catch (cause) {
      setError(cause instanceof Error ? cause : new Error("Import failed"));
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  }
  async function exportFile(format: "json" | "csv") {
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch(`/api/mentions/export?format=${format}`);
      if (!response.ok) throw new UIError("exportHttp", response.status);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `mentions.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (cause) {
      setError(cause instanceof Error ? cause : new Error("Export failed"));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Stack spacing={2}>
      <Typography color="text.secondary" variant="body2">
        {t("transferNote")}
      </Typography>
      <input
        type="file"
        accept=".json,application/json"
        ref={ref}
        hidden
        aria-label={t("fileLabel")}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void importFile(file);
        }}
      />
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <Button
          variant="contained"
          disabled={busy}
          onClick={() => ref.current?.click()}
        >
          {t("import")}
        </Button>
        <Button
          variant="outlined"
          disabled={busy}
          onClick={() => void exportFile("json")}
        >
          {t("exportJson")}
        </Button>
        <Button
          variant="outlined"
          disabled={busy}
          onClick={() => void exportFile("csv")}
        >
          {t("exportCsv")}
        </Button>
      </Stack>
      {message !== null && (
        <Alert severity="success">
          {t("imported", { count: message, formatted: formatNumber(message) })}
        </Alert>
      )}
      {error && <Alert severity="error">{errorMessage(error)}</Alert>}
    </Stack>
  );
}
