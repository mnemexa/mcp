import { BizXClient } from "../client.js";

interface HealthSignals {
  total_memories?: number;
  stale_count?: number;
  stale_rate?: number;
  never_retrieved_count?: number;
  never_retrieved_rate?: number;
  duplicate_count?: number;
  duplicate_rate?: number;
  overlong_count?: number;
  overlong_rate?: number;
  optimized_count?: number;
  optimized_rate?: number;
}

interface TopIssue {
  type: string;
  count: number;
}

interface HealthResponse {
  workspace_id?: number;
  quality_score?: number;
  signals?: HealthSignals;
  open_recommendations?: number;
  last_run_at?: string | null;
  top_issue_types?: TopIssue[];
  window_days?: number;
}

export async function health(client: BizXClient): Promise<string> {
  const r = await client.get<HealthResponse>("/v1/optimize/health");

  const score = r.quality_score ?? 0;
  const s = r.signals ?? {};
  const total = s.total_memories ?? 0;
  const stale = s.stale_count ?? 0;
  const duplicates = s.duplicate_count ?? 0;
  const overlong = s.overlong_count ?? 0;
  const neverRetrieved = s.never_retrieved_count ?? 0;
  const recommendations = r.open_recommendations ?? 0;

  const lines = [
    "Memory Health Report",
    "─────────────────────",
    `Quality Score:    ${score}/100`,
    `Total Memories:   ${total}`,
    `Stale:            ${stale}`,
    `Duplicates:       ${duplicates}`,
    `Overlong:         ${overlong}`,
    `Never Retrieved:  ${neverRetrieved}`,
    `Recommendations:  ${recommendations}`,
  ];

  const topIssues = r.top_issue_types ?? [];
  if (topIssues.length > 0) {
    lines.push("");
    lines.push("Top issues:");
    for (const issue of topIssues.slice(0, 3)) {
      lines.push(`  • ${issue.type}: ${issue.count}`);
    }
  }

  return lines.join("\n");
}

export const healthTool = {
  name: "brain.health",
  description:
    "Inspect the health and quality of your Mnemexa workspace memory store. Returns quality score (0-100), total memory count, and breakdown of stale/duplicate/overlong/never-retrieved memories. Use to diagnose memory quality issues.",
  inputSchema: {
    type: "object" as const,
    properties: {},
    required: [],
  },
};
