import { BizXClient } from "../client.js";
import { formatError } from "../errors.js";

interface StatusResponse {
  workspace_id: number;
  workspace_name: string;
  workspace_status: string;
  plan_name?: string | null;
  billing_cycle?: string | null;
  api_key_id: number;
  api_key_prefix: string;
  healthy: boolean;
  server_time: string;
}

const NOT_CONNECTED_MESSAGE = `\u{1F9E0} Mnemexa is not connected yet

Your AI is ready to use Mnemexa, but it needs access.

Please connect your workspace:

→ Open Mnemexa dashboard
→ Create your workspace
→ Generate an API key
→ Add it to your MCP configuration

Once connected, your AI will be able to remember, learn, and improve over time.`;

export async function status(client: BizXClient): Promise<string> {
  if (!client.authConfigured) {
    return NOT_CONNECTED_MESSAGE;
  }

  let response: StatusResponse;
  try {
    response = await client.get<StatusResponse>("/v1/status");
  } catch (error) {
    return [
      "⚠️ Mnemexa connection failed",
      "",
      "Your API key is configured locally, but the backend rejected the request.",
      "",
      formatError(error),
      "",
      "Open https://app.mnemexa.com to verify the key is active.",
    ].join("\n");
  }

  const lines = [
    "✅ Mnemexa connected",
    "─────────────────────",
    `Workspace:   ${response.workspace_name} (#${response.workspace_id})`,
    `Status:      ${response.workspace_status}`,
  ];

  if (response.plan_name) {
    const cycle = response.billing_cycle ? ` / ${response.billing_cycle}` : "";
    lines.push(`Plan:        ${response.plan_name}${cycle}`);
  }

  lines.push(`API Key:     ${response.api_key_prefix} (#${response.api_key_id})`);
  lines.push(`Server time: ${response.server_time}`);

  if (response.workspace_status !== "active") {
    lines.push("");
    lines.push(
      response.workspace_status === "suspended"
        ? "Note: workspace is suspended — billing / payment likely needs attention."
        : response.workspace_status === "limit_reached"
          ? "Note: workspace has hit its plan limit — upgrade or wait for the next billing cycle."
          : `Note: workspace_status is "${response.workspace_status}" — calls may be rejected.`,
    );
  }

  return lines.join("\n");
}

export const statusTool = {
  name: "brain.status",
  description:
    "Check whether Mnemexa is connected and report the active workspace, plan, and API key prefix. Useful for verifying setup end-to-end against the live backend.",
  inputSchema: {
    type: "object" as const,
    properties: {},
    required: [],
  },
};
