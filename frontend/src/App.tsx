import { LanguageSwitch } from "./LanguageSwitch";
import { useTranslation } from "react-i18next";
import { formatNumber, errorMessage } from "./i18n";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchMentions, type Mention } from "./api";
import { calculateMetrics } from "./metrics";
import { MentionFilters } from "./MentionFilters";
import { MentionForm } from "./MentionForm";
import { MentionTransfer } from "./MentionTransfer";
import { MentionList } from "./MentionList";
import { DashboardInsights } from "./DashboardInsights";
import { defaultFilters, filterMentions } from "./filtering";
export function App() {
  const { t } = useTranslation();
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState(defaultFilters);
  const [active, setActive] = useState("overview");
  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMentions(signal);
      if (!signal?.aborted) {
        setMentions(data);
        setHasLoaded(true);
      }
    } catch (cause) {
      if (!signal?.aborted)
        setError(
          cause instanceof Error ? cause : new Error("Failed to load mentions"),
        );
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
  const platforms = useMemo(
    () => [...new Set(mentions.map((m) => m.platform))].sort(),
    [mentions],
  );
  const topics = useMemo(
    () =>
      [
        ...new Set(
          mentions
            .map((m) => m.analysis?.topic)
            .filter((t): t is string => Boolean(t)),
        ),
      ].sort(),
    [mentions],
  );
  const filtered = useMemo(
    () => filterMentions(mentions, filters),
    [mentions, filters],
  );
  function attention() {
    setFilters({ ...defaultFilters, actionOnly: true, sort: "priority" });
    setActive("mentions");
    document.getElementById("mentions")?.scrollIntoView();
  }
  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Box
        component="a"
        href="#main"
        sx={{
          position: "fixed",
          left: 12,
          top: -80,
          zIndex: 2000,
          bgcolor: "white",
          p: 2,
          "&:focus": { top: 12 },
        }}
      >
        {t("skip")}
      </Box>
      <Box
        component="aside"
        sx={{
          width: { xs: "100%", md: 224 },
          position: { md: "fixed" },
          inset: { md: "0 auto 0 0" },
          bgcolor: "#edf3ef",
          borderRight: { md: "1px solid #dbe4e0" },
          p: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              bgcolor: "primary.main",
              color: "white",
              borderRadius: 3,
              p: 1,
              display: "flex",
            }}
          >
            <InsightsRoundedIcon />
          </Box>
          <Box>
            <Typography fontWeight={750} variant="body2">
              AI Brand Monitor
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t("workspace")}
            </Typography>
          </Box>
        </Stack>
        <Stack
          component="nav"
          aria-label={t("nav")}
          direction={{ xs: "row", md: "column" }}
          gap={1}
          sx={{ mt: { xs: 2, md: 5 }, overflowX: "auto" }}
        >
          {[
            ["overview", t("overview")],
            ["mentions", t("mentions")],
            ["tools", t("tools")],
          ].map(([id, label]) => (
            <Button
              key={id}
              href={`#${id}`}
              aria-current={active === id ? "location" : undefined}
              onClick={() => setActive(id)}
              sx={{
                justifyContent: "flex-start",
                whiteSpace: "nowrap",
                bgcolor: active === id ? "#d5e8dc" : "transparent",
                color: "text.primary",
              }}
            >
              {label}
            </Button>
          ))}
        </Stack>
        <Box sx={{ display: { xs: "none", md: "block" }, mt: 6 }}>
          <Typography variant="overline">{t("demo")}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t("demoNote")}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ ml: { md: "224px" } }}>
        <Container
          id="main"
          component="main"
          tabIndex={-1}
          maxWidth="xl"
          sx={{ px: { xs: 2, sm: 3, lg: 4 }, py: 3 }}
        >
          <Stack spacing={3}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ sm: "center" }}
              gap={2}
              id="overview"
            >
              <Box>
                <Typography variant="overline" color="text.secondary">
                  {t("breadcrumb")}
                </Typography>
                <Typography
                  component="h1"
                  variant="h1"
                  sx={{ overflowWrap: "anywhere" }}
                >
                  {t("title")}
                </Typography>
                <Typography
                  color="text.secondary"
                  variant="body2"
                  sx={{ mt: 1 }}
                >
                  {t("intro")}
                </Typography>
              </Box>
              <Stack
                direction="row"
                alignItems="center"
                gap={1}
                flexWrap="wrap"
              >
                <LanguageSwitch />
                <Chip label={t("sample")} size="small" variant="outlined" />
                <Button
                  aria-label={t("refreshLabel")}
                  onClick={() => void load()}
                  disabled={loading}
                  startIcon={<RefreshRoundedIcon />}
                >
                  {t("refresh")}
                </Button>
              </Stack>
            </Stack>
            <Box sx={{ borderLeft: "3px solid #155e58", pl: 2 }}>
              <Typography variant="caption" color="text.secondary">
                {t("transparency")}
              </Typography>
            </Box>
            {error && (
              <Alert
                severity="error"
                action={
                  <Button onClick={() => void load()} color="inherit">
                    {t("retry")}
                  </Button>
                }
              >
                {t("loadError", { error: errorMessage(error) })}
                {hasLoaded ? t("stale") : ""}
              </Alert>
            )}
            {!hasLoaded ? (
              loading && (
                <Stack
                  role="status"
                  alignItems="center"
                  sx={{ py: 8 }}
                  spacing={2}
                >
                  <CircularProgress aria-label={t("loadingLabel")} />
                  <Typography color="text.secondary">{t("loading")}</Typography>
                </Stack>
              )
            ) : (
              <>
                {loading && <LinearProgress aria-label={t("refreshing")} />}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "repeat(2, minmax(0, 1fr))",
                      lg: "repeat(4, minmax(0, 1fr))",
                    },
                    gap: 2,
                  }}
                >
                  {[
                    ["Mentions", metrics.total],
                    ["Positive", metrics.counts.positive],
                    ["Negative", metrics.counts.negative],
                    ["Needs attention", metrics.actionRequired],
                  ].map(([label, value]) => (
                    <Card
                      key={label}
                      data-testid={`metric-${label}`}
                      sx={{
                        bgcolor:
                          label === "Needs attention" ? "#e9f2ed" : "white",
                      }}
                    >
                      <CardContent>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ overflowWrap: "anywhere" }}
                        >
                          {t(
                            (
                              {
                                Mentions: "mentions",
                                Positive: "positiveKpi",
                                Negative: "negativeKpi",
                                "Needs attention": "attention",
                              } as Record<string, string>
                            )[label],
                          )}
                        </Typography>
                        <Typography
                          data-testid="metric-value"
                          sx={{
                            fontSize: { xs: 32, md: 40 },
                            fontWeight: 700,
                            letterSpacing: "-0.04em",
                            mt: 1,
                          }}
                        >
                          {formatNumber(Number(value))}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
                <DashboardInsights
                  mentions={mentions}
                  onAttention={attention}
                />
                <Card id="mentions">
                  <CardContent>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      justifyContent="space-between"
                      gap={1}
                      sx={{ mb: 3 }}
                    >
                      <Box>
                        <Typography component="h2" variant="h2">
                          {t("mentions")}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.5 }}
                        >
                          {t("listIntro")}
                        </Typography>
                      </Box>
                      <Button onClick={attention}>{t("attentionFirst")}</Button>
                    </Stack>
                    <MentionFilters
                      filters={filters}
                      onChange={setFilters}
                      platforms={platforms}
                      topics={topics}
                    />
                    <Typography
                      role="status"
                      variant="body2"
                      color="text.secondary"
                      sx={{ my: 2 }}
                    >
                      {t("showing", {
                        shown: formatNumber(filtered.length),
                        total: formatNumber(mentions.length),
                      })}
                    </Typography>
                    {!filtered.length ? (
                      <Alert severity="info">{t("empty")}</Alert>
                    ) : (
                      <MentionList
                        mentions={filtered}
                        selectedId={selectedId}
                        onSelect={setSelectedId}
                      />
                    )}
                  </CardContent>
                </Card>
                <Box id="tools">
                  <Typography component="h2" variant="h2" sx={{ mb: 1 }}>
                    {t("tools")}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {t("toolsIntro")}
                  </Typography>
                  <Stack spacing={2}>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                        <Typography fontWeight={650}>{t("add")}</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <MentionForm onCreated={() => load()} />
                      </AccordionDetails>
                    </Accordion>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                        <Typography fontWeight={650}>
                          {t("transfer")}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <MentionTransfer onImported={() => load()} />
                      </AccordionDetails>
                    </Accordion>
                  </Stack>
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ pt: 1 }}
                >
                  {t("footer")}
                </Typography>
              </>
            )}
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
