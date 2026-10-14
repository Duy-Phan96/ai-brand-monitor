import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import {
  Alert, AppBar, Box, Button, Card, CardContent, Chip, CircularProgress,
  Container, Divider, LinearProgress, Stack, Toolbar, Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchMentions, type Mention } from "./api";
import { calculateMetrics, sentiments } from "./metrics";
import { MentionFilters } from "./MentionFilters";
import { MentionForm } from "./MentionForm";
import { MentionTransfer } from "./MentionTransfer";
import { defaultFilters, filterMentions } from "./filtering";

const sentimentColor = {
  positive: "success", negative: "error", neutral: "default", mixed: "warning",
} as const;

export function App() {
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [selected, setSelected] = useState<Mention | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState(defaultFilters);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMentions(signal);
      if (!signal?.aborted) setMentions(data);
    } catch (cause) {
      if (!signal?.aborted) setError(cause instanceof Error ? cause.message : "Failed to load mentions");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const metrics = useMemo(() => calculateMetrics(mentions), [mentions]);
  const platforms = useMemo(() => [...new Set(mentions.map(m => m.platform))].sort(), [mentions]);
  const topics = useMemo(() => [...new Set(mentions.map(m => m.analysis?.topic).filter((t): t is string => Boolean(t)))].sort(), [mentions]);
  const filtered = useMemo(() => filterMentions(mentions, filters), [mentions, filters]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <InsightsRoundedIcon sx={{ mr: 1.5 }} />
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>AI Brand Monitor</Typography>
          <Chip label="Sample-data MVP" size="small" variant="outlined" />
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="overline" color="primary">Brand intelligence workspace</Typography>
            <Typography variant="h4" component="h2" fontWeight={700}>Monitoring overview</Typography>
            <Typography color="text.secondary">Insights calculated from stored mentions. Sample records are fictional.</Typography>
          </Box>
          {error && <Alert severity="error" action={<Button onClick={() => void load()} color="inherit">Retry</Button>}>Unable to load dashboard: {error}</Alert>}
          {loading ? <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress aria-label="Loading mentions" /></Box> : (
            <>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2 }}>
                {[
                  ["Mentions", metrics.total], ["Positive", metrics.counts.positive],
                  ["Negative", metrics.counts.negative], ["Needs attention", metrics.actionRequired],
                ].map(([label, value]) => (
                  <Card variant="outlined" key={label}>
                    <CardContent>
                      <Typography color="text.secondary" variant="body2">{label}</Typography>
                      <Typography variant="h4" fontWeight={700}>{value}</Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
                <Card variant="outlined"><CardContent>
                  <Typography variant="h6" gutterBottom>Sentiment distribution</Typography>
                  <Stack spacing={1}>{sentiments.map(s => (
                    <Stack key={s} direction="row" justifyContent="space-between">
                      <Typography sx={{ textTransform: "capitalize" }}>{s}</Typography><Typography fontWeight={600}>{metrics.counts[s]}</Typography>
                    </Stack>
                  ))}</Stack>
                </CardContent></Card>
                <Card variant="outlined"><CardContent>
                  <Typography variant="h6" gutterBottom>Top topics</Typography>
                  <Stack spacing={1}>{Object.entries(metrics.topics).sort((a,b) => b[1]-a[1]).slice(0,5).map(([topic,count]) =>
                    <Stack key={topic} direction="row" justifyContent="space-between"><Typography>{topic}</Typography><Typography fontWeight={600}>{count}</Typography></Stack>
                  )}</Stack>
                  {Object.keys(metrics.topics).length === 0 && <Typography color="text.secondary">No analyzed mentions yet.</Typography>}
                </CardContent></Card>
              </Box>
              <Card variant="outlined"><CardContent>
                <Typography variant="h6" gutterBottom>Mention activity over time</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Published mentions per day (UTC), based on stored records
                </Typography>
                <Stack spacing={1}>
                  {Object.entries(metrics.activity).sort(([a], [b]) => a.localeCompare(b)).map(([day, count]) => (
                    <Stack key={day} direction="row" spacing={2} alignItems="center">
                      <Typography variant="body2" sx={{ minWidth: 95 }}>{day}</Typography>
                      <LinearProgress variant="determinate" value={metrics.total ? count / metrics.total * 100 : 0}
                        sx={{ height: 10, borderRadius: 3, flex: 1 }} />
                      <Typography variant="body2" sx={{ minWidth: 25, textAlign: "right" }}>{count}</Typography>
                    </Stack>
                  ))}
                  {Object.keys(metrics.activity).length === 0 &&
                    <Typography color="text.secondary">No activity to display.</Typography>}
                </Stack>
              </CardContent></Card>
              <Card variant="outlined"><CardContent>
                <Typography variant="h6" gutterBottom>Add mention</Typography>
                <MentionForm onCreated={() => load()} />
              </CardContent></Card>
              <Card variant="outlined"><CardContent>
                <Typography variant="h6" gutterBottom>Import & export</Typography>
                <MentionTransfer onImported={() => load()} />
              </CardContent></Card>
              <Card variant="outlined"><CardContent>
                <Typography variant="h6" gutterBottom>Mentions</Typography>
                <MentionFilters filters={filters} onChange={setFilters} platforms={platforms} topics={topics} />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Showing {filtered.length} of {mentions.length} mentions
                </Typography>
                {filtered.length===0 ? <Alert severity="info">No mentions match the current filters. Clear filters or add sample data through the seed command.</Alert> :
                <Stack divider={<Divider flexItem />} gap={1}>
                  {filtered.map(m=><Box key={m.id} sx={{py:1}}>
                    <Stack direction="row" flexWrap="wrap" alignItems="center" gap={1} sx={{mb:1}}>
                      <Typography fontWeight={600}>{m.brand}</Typography>
                      <Chip size="small" label={m.platform} variant="outlined" />
                      {m.analysis && <Chip size="small" label={m.analysis.sentiment} color={sentimentColor[m.analysis.sentiment]} />}
                      {m.analysis?.action_required && <Chip size="small" label={m.analysis.priority + " priority"} color="warning" />}
                      {m.is_sample && <Chip size="small" label="Fictional sample" variant="outlined" />}
                    </Stack>
                    <Typography variant="body2">{m.content}</Typography>
                    <Button size="small" onClick={()=>setSelected(selected?.id===m.id?null:m)} sx={{mt:1}}>
                      {selected?.id===m.id?"Hide details":"View analysis"}
                    </Button>
                    {selected?.id===m.id && <Box sx={{bgcolor:"action.hover",p:2,borderRadius:2,mt:1}}>
                      {m.analysis ? <Stack spacing={1}>
                        <Typography variant="body2"><strong>Topic:</strong> {m.analysis.topic}</Typography>
                        <Typography variant="body2"><strong>Relevant:</strong> {m.analysis.relevant?"Yes":"No"}</Typography>
                        <Typography variant="body2"><strong>Analysis:</strong> {m.analysis.explanation}</Typography>
                        <Typography variant="body2"><strong>Recommendation:</strong> {m.analysis.suggested_action??"No action suggested"}</Typography>
                        <Typography variant="caption" color="text.secondary">Method: {m.analysis.method}{m.analysis.model_name?` (${m.analysis.model_name})`:""}</Typography>
                      </Stack> : <Typography>Not analyzed</Typography>}
                      {m.source_url ? <Button href={m.source_url} target="_blank" rel="noopener noreferrer">Open source</Button> : <Typography variant="caption" display="block" color="text.secondary">No original source link (fictional example).</Typography>}
                    </Box>}
                  </Box>)}
                </Stack>}
              </CardContent></Card>
              <Button startIcon={<RefreshRoundedIcon />} onClick={()=>void load()} sx={{alignSelf:"flex-start"}}>Refresh</Button>
            </>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
