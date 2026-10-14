import { Button, Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Select, Stack, TextField } from "@mui/material";
import type { MentionFilters as Filters } from "./filtering";

interface Props {
  filters: Filters;
  onChange: (next: Filters) => void;
  platforms: string[];
  topics: string[];
}

export function MentionFilters({ filters, onChange, platforms, topics }: Props) {
  const update = <K extends keyof Filters>(key: K, value: Filters[K]) => onChange({ ...filters, [key]: value });
  return (
    <Stack spacing={2} sx={{ mb: 2 }}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField label="Search mentions" size="small" value={filters.search}
          onChange={e => update("search", e.target.value)} sx={{ flex: 1 }} />
        {([
          ["sentiment", "Sentiment", ["positive", "negative", "neutral", "mixed"]],
          ["platform", "Platform", platforms],
          ["topic", "Topic", topics],
          ["priority", "Priority", ["critical", "high", "medium", "low"]],
        ] as const).map(([key, label, values]) => (
          <FormControl key={key} size="small" sx={{ minWidth: 130 }}>
            <InputLabel id={key + "-filter-label"}>{label}</InputLabel>
            <Select labelId={key + "-filter-label"} label={label} value={filters[key]}
              onChange={e => update(key, e.target.value)}>
              <MenuItem value="all">All</MenuItem>
              {values.map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}
            </Select>
          </FormControl>
        ))}
      </Stack>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
        <TextField type="date" size="small" label="From" slotProps={{ inputLabel: { shrink: true } }}
          value={filters.from} onChange={e => update("from", e.target.value)} />
        <TextField type="date" size="small" label="To" slotProps={{ inputLabel: { shrink: true } }}
          value={filters.to} onChange={e => update("to", e.target.value)} />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="sort-filter-label">Sort</InputLabel>
          <Select labelId="sort-filter-label" label="Sort" value={filters.sort}
            onChange={e => update("sort", e.target.value as Filters["sort"])}>
            <MenuItem value="newest">Newest first</MenuItem>
            <MenuItem value="oldest">Oldest first</MenuItem>
            <MenuItem value="priority">Highest priority</MenuItem>
          </Select>
        </FormControl>
        <FormControlLabel control={<Checkbox checked={filters.actionOnly}
          onChange={e => update("actionOnly", e.target.checked)} />} label="Needs attention" />
        <Button onClick={() => onChange({
          search: "", sentiment: "all", platform: "all", topic: "all",
          priority: "all", actionOnly: false, from: "", to: "", sort: "newest",
        })}>Reset filters</Button>
      </Stack>
    </Stack>
  );
}
