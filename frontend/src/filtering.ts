import type { Mention } from "./api";

export interface MentionFilters {
  search: string;
  sentiment: string;
  platform: string;
  topic: string;
  priority: string;
  actionOnly: boolean;
  from: string;
  to: string;
  sort: "newest" | "oldest" | "priority";
}

export const defaultFilters: MentionFilters = {
  search: "", sentiment: "all", platform: "all", topic: "all",
  priority: "all", actionOnly: false, from: "", to: "", sort: "newest",
};

const rank: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };

export function filterMentions(mentions: Mention[], filters: MentionFilters): Mention[] {
  const text = filters.search.trim().toLocaleLowerCase();
  const matching = mentions.filter(m => {
    const date = m.published_at.slice(0, 10);
    return (!text || `${m.brand} ${m.content} ${m.platform}`.toLocaleLowerCase().includes(text))
      && (filters.sentiment === "all" || m.analysis?.sentiment === filters.sentiment)
      && (filters.platform === "all" || m.platform === filters.platform)
      && (filters.topic === "all" || m.analysis?.topic === filters.topic)
      && (filters.priority === "all" || m.analysis?.priority === filters.priority)
      && (!filters.actionOnly || m.analysis?.action_required === true)
      && (!filters.from || date >= filters.from)
      && (!filters.to || date <= filters.to);
  });
  return [...matching].sort((a, b) => {
    if (filters.sort === "priority") {
      const delta = (rank[b.analysis?.priority ?? ""] ?? 0) - (rank[a.analysis?.priority ?? ""] ?? 0);
      if (delta) return delta;
    }
    return filters.sort === "oldest"
      ? a.published_at.localeCompare(b.published_at) || a.id - b.id
      : b.published_at.localeCompare(a.published_at) || b.id - a.id;
  });
}
