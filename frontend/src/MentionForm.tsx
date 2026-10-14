import { Alert, Button, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { createMention } from "./api";

interface Props { onCreated: () => Promise<void>; }

export function MentionForm({ onCreated }: Props) {
  const [brand, setBrand] = useState("Aurora");
  const [platform, setPlatform] = useState("Manual entry");
  const [content, setContent] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setSuccess(false);
    try {
      await createMention({
        brand: brand.trim(), platform: platform.trim(), content: content.trim(),
        source_url: sourceUrl.trim() || null, is_sample: true,
        published_at: new Date().toISOString(),
      });
      setContent("");
      setSourceUrl("");
      setSuccess(true);
      await onCreated();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to add mention");
    } finally {
      setBusy(false);
    }
  }
  return <Stack component="form" onSubmit={e => void submit(e)} spacing={2}>
    <Typography variant="body2" color="text.secondary">
      Add a fictional example for the demo. New records are clearly labeled as sample data.
    </Typography>
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
      <TextField label="Brand" required value={brand} onChange={e => setBrand(e.target.value)} inputProps={{ maxLength: 120 }} />
      <TextField label="Platform" required value={platform} onChange={e => setPlatform(e.target.value)} inputProps={{ maxLength: 80 }} />
    </Stack>
    <TextField label="Mention content" multiline minRows={3} required value={content}
      onChange={e => setContent(e.target.value)} inputProps={{ maxLength: 10000 }} />
    <TextField label="Source URL (optional)" type="url" value={sourceUrl}
      onChange={e => setSourceUrl(e.target.value)} placeholder="https://example.com/post" />
    {error && <Alert severity="error">{error}</Alert>}
    {success && <Alert severity="success">Fictional mention added and analyzed.</Alert>}
    <Button type="submit" variant="contained" disabled={busy || !brand.trim() || !platform.trim() || !content.trim()}>
      {busy ? "Saving..." : "Add sample mention"}
    </Button>
  </Stack>;
}
