import { topicLabel } from "./i18n/topics";
import { useTranslation } from "react-i18next";
import { formatDate, formatNumber } from "./i18n";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import type { Mention } from "./api";
import { calculateMetrics, sentiments } from "./metrics";
export const sentimentColors = {
  positive: "#387b55",
  negative: "#b4474e",
  neutral: "#7c8c89",
  mixed: "#a3732a",
};
export function DashboardInsights({
  mentions,
  onAttention,
}: {
  mentions: Mention[];
  onAttention: () => void;
}) {
  const { t } = useTranslation();
  const metrics = calculateMetrics(mentions);
  const analyzed = sentiments.reduce((sum, s) => sum + metrics.counts[s], 0);
  const days = Object.entries(metrics.activity).sort(([a], [b]) =>
    a.localeCompare(b),
  );
  const maximum = Math.max(1, ...days.map(([, count]) => count));
  const urgent = mentions.filter(
    (m) =>
      m.analysis?.action_required &&
      ["high", "critical"].includes(m.analysis.priority),
  ).length;
  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1.25fr 1fr" },
          gap: 2,
        }}
      >
        <Card>
          <CardContent>
            <Typography component="h2" variant="h3">
              {t("activity")}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {t("activityCaption", {
                count: days.length,
                formatted: formatNumber(days.length),
              })}
            </Typography>
            {days.length ? (
              <>
                <Box
                  component="svg"
                  viewBox="0 0 600 170"
                  role="img"
                  aria-label={t("dailyLabel", {
                    values: days
                      .map(
                        ([day, count]) =>
                          `${formatDate(day)}: ${formatNumber(count)}`,
                      )
                      .join(", "),
                  })}
                  sx={{ width: "100%", mt: 2, display: "block" }}
                >
                  <line x1="30" y1="142" x2="570" y2="142" stroke="#dbe4e0" />
                  {days.map(([day, count], index) => {
                    const x = 30 + ((index + 0.5) / days.length) * 540;
                    const height = (count / maximum) * 100;
                    return (
                      <g key={day}>
                        <rect
                          x={x - Math.min(22, 210 / days.length)}
                          y={142 - height}
                          width={Math.min(44, 420 / days.length)}
                          height={height}
                          rx="5"
                          fill="#155e58"
                        />
                        <text
                          x={x}
                          y={130 - height}
                          textAnchor="middle"
                          fontSize="14"
                          fill="#182c2a"
                        >
                          {formatNumber(count)}
                        </text>
                      </g>
                    );
                  })}
                </Box>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption">
                    {formatDate(days[0][0])}
                  </Typography>
                  <Typography variant="caption">
                    {days.length > 1
                      ? formatDate(days[days.length - 1][0])
                      : t("oneDay")}
                  </Typography>
                </Stack>
                <details>
                  <summary
                    style={{
                      cursor: "pointer",
                      marginTop: 12,
                      color: "#155e58",
                    }}
                  >
                    {t("dailyCounts")}
                  </summary>
                  <Box component="ul" sx={{ pl: 2 }}>
                    {days.map(([day, count]) => (
                      <li key={day}>
                        {t("dailyRow", {
                          date: formatDate(day),
                          count,
                          formatted: formatNumber(count),
                        })}
                      </li>
                    ))}
                  </Box>
                </details>
              </>
            ) : (
              <Typography sx={{ py: 6 }} color="text.secondary">
                {t("noActivity")}
              </Typography>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography component="h2" variant="h3">
              {t("sentimentDistribution")}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1, mb: 3 }}
            >
              {t("analyzedCaption", {
                count: analyzed,
                formatted: formatNumber(analyzed),
              })}
            </Typography>
            <Box
              aria-hidden="true"
              sx={{
                display: "flex",
                height: 14,
                borderRadius: 8,
                overflow: "hidden",
                bgcolor: "#edf1ef",
                mb: 3,
              }}
            >
              {sentiments.map((s) => (
                <Box
                  key={t(s)}
                  sx={{
                    width: analyzed
                      ? `${(metrics.counts[s] / analyzed) * 100}%`
                      : 0,
                    bgcolor: sentimentColors[s],
                  }}
                />
              ))}
            </Box>
            <Stack spacing={2}>
              {sentiments.map((s) => (
                <Stack
                  key={t(s)}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                      aria-hidden="true"
                      sx={{
                        width: 9,
                        height: 9,
                        borderRadius: "50%",
                        bgcolor: sentimentColors[s],
                      }}
                    />
                    <Typography
                      sx={{ textTransform: "capitalize" }}
                      variant="body2"
                    >
                      {t(s)}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" fontWeight={650}>
                    {formatNumber(metrics.counts[s])}{" "}
                    <Box
                      component="span"
                      sx={{ color: "text.secondary", ml: 1 }}
                    >
                      {analyzed
                        ? Math.round((metrics.counts[s] / analyzed) * 100)
                        : 0}
                      %
                    </Box>
                  </Typography>
                </Stack>
              ))}
            </Stack>
            {mentions.length > analyzed && (
              <Typography variant="caption" sx={{ display: "block", mt: 2 }}>
                {t("unanalyzed", {
                  count: mentions.length - analyzed,
                  formatted: formatNumber(mentions.length - analyzed),
                })}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 2,
        }}
      >
        <Card>
          <CardContent>
            <Typography component="h2" variant="h3" sx={{ mb: 2 }}>
              {t("topics")}
            </Typography>
            <Stack spacing={1.5}>
              {Object.entries(metrics.topics)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([topic, count], index) => (
                  <Stack
                    key={topic}
                    direction="row"
                    justifyContent="space-between"
                  >
                    <Typography variant="body2">
                      <Box
                        component="span"
                        sx={{ color: "text.secondary", mr: 2 }}
                      >
                        0{index + 1}
                      </Box>
                      {topicLabel(topic, t)}
                    </Typography>
                    <Typography variant="body2" fontWeight={650}>
                      {formatNumber(count)}
                    </Typography>
                  </Stack>
                ))}
            </Stack>
            {!Object.keys(metrics.topics).length && (
              <Typography color="text.secondary">{t("noAnalysis")}</Typography>
            )}
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: "#e9f2ed", borderColor: "#c7ddd0" }}>
          <CardContent>
            <Typography component="h2" variant="h3">
              {t("action")}
            </Typography>
            <Typography sx={{ my: 1 }} variant="body2">
              {t("actionCaption", {
                count: metrics.actionRequired,
                formatted: formatNumber(metrics.actionRequired),
                urgent: formatNumber(urgent),
              })}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {t("reviewNote")}
            </Typography>
            <Button sx={{ mt: 2 }} variant="contained" onClick={onAttention}>
              {t("queue")}
            </Button>
          </CardContent>
        </Card>
      </Box>
    </>
  );
}
