export interface MentionAnalysis {
  relevant: boolean;
  sentiment: "positive" | "negative" | "neutral" | "mixed";
  topic: string;
  action_required: boolean;
  priority: "low" | "medium" | "high" | "critical";
  summary: string;
  explanation: string;
  suggested_action: string | null;
  method: "deterministic" | "llm" | "human";
  model_name: string | null;
}
export interface Mention {
  id: number;
  brand: string;
  content: string;
  platform: string;
  published_at: string;
  source_url: string | null;
  is_sample: boolean;
  analysis: MentionAnalysis | null;
}
export async function fetchMentions(signal?: AbortSignal): Promise<Mention[]> {
  const response = await fetch("/api/mentions", { signal });
  if (!response.ok) throw new Error(`API returned ${response.status}`);
  return (await response.json()) as Mention[];
}
