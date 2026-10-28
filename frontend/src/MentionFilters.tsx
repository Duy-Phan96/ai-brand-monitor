import { topicLabel } from "./i18n/topics";
import { useTranslation } from "react-i18next";
import { formatNumber } from "./i18n";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  Chip,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import type { MentionFilters as Filters } from "./filtering";
interface Props {
  filters: Filters;
  onChange: (next: Filters) => void;
  platforms: string[];
  topics: string[];
}
export function MentionFilters({
  filters,
  onChange,
  platforms,
  topics,
}: Props) {
  const { t } = useTranslation();
  const update = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    onChange({ ...filters, [key]: value });
  const activeCount =
    Number(Boolean(filters.search.trim())) +
    [
      filters.sentiment,
      filters.platform,
      filters.topic,
      filters.priority,
    ].filter((value) => value !== "all").length +
    Number(filters.actionOnly) +
    Number(Boolean(filters.from)) +
    Number(Boolean(filters.to));
  return (
    <Stack spacing={2} sx={{ mb: 2 }}>
      <Stack spacing={2}>
        <TextField
          label={t("search")}
          size="small"
          value={filters.search}
          onChange={(e) => update("search", e.target.value)}
          sx={{ flex: 1 }}
        />
        {activeCount > 0 && (
          <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
            <Chip
              size="small"
              label={t("activeFilters", {
                count: activeCount,
                formatted: formatNumber(activeCount),
              })}
              variant="outlined"
            />
            {filters.actionOnly && (
              <Chip
                size="small"
                label={t("attentionQueue")}
                onDelete={() => update("actionOnly", false)}
              />
            )}
            <Button
              size="small"
              onClick={() =>
                onChange({
                  search: "",
                  sentiment: "all",
                  platform: "all",
                  topic: "all",
                  priority: "all",
                  actionOnly: false,
                  from: "",
                  to: "",
                  sort: "newest",
                })
              }
            >
              {t("clear")}
            </Button>
          </Stack>
        )}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
            <Typography variant="body2" fontWeight={600}>
              {t("filters")}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <Stack
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr 1fr",
                    lg: "repeat(4, 1fr)",
                  },
                  gap: 2,
                }}
              >
                {(
                  [
                    [
                      "sentiment",
                      t("sentiment"),
                      ["positive", "negative", "neutral", "mixed"],
                    ],
                    ["platform", t("platform"), platforms],
                    ["topic", t("topic"), topics],
                    [
                      "priority",
                      t("priority"),
                      ["critical", "high", "medium", "low"],
                    ],
                  ] as const
                ).map(([key, label, values]) => (
                  <FormControl key={key} size="small" sx={{ minWidth: 130 }}>
                    <InputLabel id={key + "-filter-label"}>{label}</InputLabel>
                    <Select
                      labelId={key + "-filter-label"}
                      label={label}
                      value={filters[key]}
                      onChange={(e) => update(key, e.target.value)}
                    >
                      <MenuItem value="all">{t("all")}</MenuItem>
                      {values.map((value) => (
                        <MenuItem key={value} value={value}>
                          {key === "sentiment" || key === "priority"
                            ? t(value)
                            : key === "topic"
                              ? topicLabel(value, t)
                              : value}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ))}
              </Stack>
              <Stack
                direction={{ xs: "column", lg: "row" }}
                spacing={2}
                alignItems={{ lg: "center" }}
              >
                <TextField
                  type="date"
                  size="small"
                  label={t("from")}
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={filters.from}
                  onChange={(e) => update("from", e.target.value)}
                />
                <TextField
                  type="date"
                  size="small"
                  label={t("to")}
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={filters.to}
                  onChange={(e) => update("to", e.target.value)}
                />
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel id="sort-filter-label">{t("sort")}</InputLabel>
                  <Select
                    labelId="sort-filter-label"
                    label={t("sort")}
                    value={filters.sort}
                    onChange={(e) =>
                      update("sort", e.target.value as Filters["sort"])
                    }
                  >
                    <MenuItem value="newest">{t("newest")}</MenuItem>
                    <MenuItem value="oldest">{t("oldest")}</MenuItem>
                    <MenuItem value="priority">{t("highest")}</MenuItem>
                  </Select>
                </FormControl>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filters.actionOnly}
                      onChange={(e) => update("actionOnly", e.target.checked)}
                    />
                  }
                  label={t("attention")}
                />
                <Button
                  onClick={() =>
                    onChange({
                      search: "",
                      sentiment: "all",
                      platform: "all",
                      topic: "all",
                      priority: "all",
                      actionOnly: false,
                      from: "",
                      to: "",
                      sort: "newest",
                    })
                  }
                >
                  {t("reset")}
                </Button>
              </Stack>
            </Stack>
          </AccordionDetails>
        </Accordion>
      </Stack>
    </Stack>
  );
}
