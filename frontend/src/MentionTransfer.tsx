import { Alert, Button, Stack, Typography } from "@mui/material";
import { useRef, useState } from "react";

interface Props {
  onImported: () => Promise<void>;
}

type SampleMention = {
  brand: string; content: string; platform: string; published_at: string;
  source_url: string | null; is_sample: true;
};

function isSampleMention(input: unknown): input is SampleMention {
  if (!input || typeof input !== "object") return false;
  const m = input as Record<string, unknown>;
  return typeof m.brand === "string" && m.brand.trim().length > 0
    && typeof m.content === "string" && m.content.trim().length > 0
    && typeof m.platform === "string" && m.platform.trim().length > 0
    && typeof m.published_at === "string" && !Number.isNaN(Date.parse(m.published_at))
    && (m.source_url === null || typeof m.source_url === "string")
    && m.is_sample === true;
}

export function MentionTransfer({ onImported }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function importFile(file: File) {
    setBusy(true); setMessage(""); setError("");
    try {
      if (file.size > 1_000_000) throw new Error("File must be 1 MB or smaller.");
      const parsed: unknown = JSON.parse(await file.text());
      if (!parsed || typeof parsed !== "object" || !("mentions" in parsed)) {
        throw new Error('Expected an object with a "mentions" array.');
      }
      const records = (parsed as { mentions: unknown }).mentions;
      if (!Array.isArray(records) || records.length === 0 || records.length > 500 || !records.every(isSampleMention)) {
        throw new Error("Include 1–500 valid fictional sample mentions.");
      }
      const response = await fetch("/api/mentions/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentions: records }),
      });
      if (!response.ok) throw new Error(`Import rejected (HTTP ${response.status}). Check field formats and URLs.`);
      const result = (await response.json()) as { imported: number };
      setMessage(`Imported ${result.imported} fictional sample mentions.`);
      await onImported();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Import failed");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  }

  async function exportFile(format: "json" | "csv") {
    setBusy(true); setMessage(""); setError("");
    try {
      const response = await fetch(`/api/mentions/export?format=${format}`);
      if (!response.ok) throw new Error(`Export failed (HTTP ${response.status})`);
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
      setError(cause instanceof Error ? cause.message : "Export failed");
    } finally {
      setBusy(false);
    }
  }

  return <Stack spacing={2}>
    <Typography color="text.secondary" variant="body2">
      Import fictional JSON sample records. Imports are validated as a batch. Export all stored records as JSON or CSV.
    </Typography>
    <input type="file" accept=".json,application/json" ref={ref} hidden aria-label="Select sample JSON file"
      onChange={event => { const file = event.target.files?.[0]; if (file) void importFile(file); }} />
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
      <Button variant="contained" disabled={busy} onClick={() => ref.current?.click()}>Import JSON</Button>
      <Button variant="outlined" disabled={busy} onClick={() => void exportFile("json")}>Export JSON</Button>
      <Button variant="outlined" disabled={busy} onClick={() => void exportFile("csv")}>Export CSV</Button>
    </Stack>
    {message && <Alert severity="success">{message}</Alert>}
    {error && <Alert severity="error">{error}</Alert>}
  </Stack>;
}
