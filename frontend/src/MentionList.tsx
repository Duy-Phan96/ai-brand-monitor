import { topicLabel } from "./i18n/topics";
import { useTranslation } from "react-i18next";
import { formatDate, formatNumber } from "./i18n";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import type { Mention } from "./api";
import { analysisText } from "./analysisText";
const colors = {
  positive: "success",
  negative: "error",
  neutral: "default",
  mixed: "warning",
} as const;
export function MentionList({
  mentions,
  selectedId,
  onSelect,
}: {
  mentions: Mention[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
}) {
  const { t, i18n } = useTranslation();
  return (
    <Stack divider={<Divider />} spacing={1}>
      {mentions.map((m) => {
        const text = m.analysis ? analysisText(m.analysis, i18n.language) : null;
        return (
          <Box
            key={m.id}
            data-testid="mention-record"
            sx={{ py: 2, overflowWrap: "anywhere" }}
          >
            <Stack direction="row" flexWrap="wrap" alignItems="center" gap={1}>
              <Typography component="h3" fontWeight={700}>
                {m.brand}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {m.platform} / {formatDate(m.published_at)}
              </Typography>
              {m.is_sample && (
                <Chip size="small" label={t("fictional")} variant="outlined" />
              )}
            </Stack>
            <Typography variant="body2" sx={{ my: 1.5, lineHeight: 1.7 }}>
              {m.content}
            </Typography>
            <Stack direction="row" gap={1} flexWrap="wrap" alignItems="center">
              {m.analysis && (
                <>
                  <Chip
                    size="small"
                    label={t(m.analysis.sentiment)}
                    color={colors[m.analysis.sentiment]}
                    variant="outlined"
                  />
                  <Chip
                    size="small"
                    label={t("priorityChip", {
                      priority: t(m.analysis.priority),
                    })}
                    variant="outlined"
                  />
                  {m.analysis.action_required && (
                    <Chip
                      size="small"
                      label={t("action")}
                      color="warning"
                      variant="outlined"
                    />
                  )}
                  <Typography variant="caption" color="text.secondary">
                    {m.analysis.method === "llm"
                      ? t("llm")
                      : m.analysis.method === "human"
                        ? t("human")
                        : t("rules")}
                  </Typography>
                </>
              )}
              <Button
                size="small"
                aria-expanded={selectedId === m.id}
                aria-controls={`mention-details-${m.id}`}
                onClick={() => onSelect(selectedId === m.id ? null : m.id)}
                sx={{ ml: { sm: "auto" } }}
              >
                {selectedId === m.id ? t("hide") : t("view")}
              </Button>
            </Stack>
            {selectedId === m.id && (
              <Box
                id={`mention-details-${m.id}`}
                role="region"
                aria-label={t("detailLabel", {
                  brand: m.brand,
                  id: formatNumber(m.id),
                })}
                sx={{
                  mt: 2,
                  p: { xs: 2, md: 3 },
                  bgcolor: "#f3f6f4",
                  borderRadius: 3,
                }}
              >
                {m.analysis ? (
                  <Stack spacing={2}>
                    <Typography variant="caption" color="text.secondary">
                      {t("sourceLanguage")}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t(text?.source === "stored" ? "analysisStoredText" : "analysisDerivedText")}
                    </Typography>
                    <Typography data-testid="analysis-summary" fontWeight={650}>{text?.summary}</Typography>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                        gap: 1,
                      }}
                    >
                      <Typography variant="body2">
                        <strong>{t("sentimentLabel")}</strong>{" "}
                        {t(m.analysis.sentiment)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>{t("priorityLabel")}</strong>{" "}
                        {t(m.analysis.priority)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>{t("topicLabel")}</strong> {topicLabel(m.analysis.topic, t)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>{t("relevanceLabel")}</strong>{" "}
                        {m.analysis.relevant ? t("yes") : t("no")}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="overline">{t("nextStep")}</Typography>
                      <Typography variant="body2" data-testid="analysis-action">
                        {text?.suggested_action ?? t("noAction")}
                      </Typography>
                    </Box>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                        <Typography variant="body2" fontWeight={600}>
                          {t("provenance")}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" data-testid="analysis-explanation">
                          {text?.explanation}
                        </Typography>
                        <Box component="details" sx={{ mt: 2 }}>
                          <Box component="summary" sx={{ cursor: "pointer" }}>{t("analysisOriginal")}</Box>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            <strong>{t("analysisSummaryLabel")}</strong> {m.analysis.summary}
                          </Typography>
                          <Typography variant="body2">{m.analysis.explanation}</Typography>
                          <Typography variant="body2">{m.analysis.suggested_action ?? t("noAction")}</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {t("method", {
                            method:
                              m.analysis.method === "deterministic"
                                ? t("deterministic")
                                : m.analysis.method === "human"
                                  ? t("humanMethod")
                                  : t("llmMethod"),
                          })}
                          {m.analysis.model_name
                            ? ` (${m.analysis.model_name})`
                            : ""}
                        </Typography>
                        <Typography variant="caption">
                          {m.analysis.method === "deterministic"
                            ? t("rulesNote")
                            : m.analysis.method === "human"
                              ? t("humanNote")
                              : t("llmNote")}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  </Stack>
                ) : (
                  <Typography>{t("notAnalyzed")}</Typography>
                )}
                {m.source_url ? (
                  <Button
                    href={m.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ mt: 1 }}
                  >
                    {t("source")}
                  </Button>
                ) : (
                  <Typography
                    variant="caption"
                    display="block"
                    color="text.secondary"
                    sx={{ mt: 2 }}
                  >
                    {t("noSource")}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        );
      })}
    </Stack>
  );
}
