import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { homedir, platform } from "node:os";
import { join } from "node:path";
import { createInterface } from "node:readline";

const CONFIG_DIR = join(homedir(), ".mnemexa");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");
// Backward-compat: read from the legacy ~/.bizxengine path if the new one is missing.
// Writes always go to the new path.
const LEGACY_CONFIG_DIR = join(homedir(), ".bizxengine");
const LEGACY_CONFIG_FILE = join(LEGACY_CONFIG_DIR, "config.json");

// ANSI colors
const green = "\x1b[32m";
const yellow = "\x1b[33m";
const cyan = "\x1b[36m";
const magenta = "\x1b[35m";
const dim = "\x1b[2m";
const bold = "\x1b[1m";
const reset = "\x1b[0m";

// The MCP server entry — no API key needed since we read from ~/.mnemexa/config.json
const MCP_SERVER_ENTRY = {
  command: "npx",
  args: ["-y", "@mnemexa/mcp"],
};

// OpenClaw doesn't auto-spawn child env from ~/.mnemexa/config.json — it needs the
// key explicitly in the MCP server entry's env block.
function buildMcpServerEntryWithEnv(apiKey: string): Record<string, unknown> {
  return {
    command: "npx",
    args: ["-y", "@mnemexa/mcp"],
    env: { MNEMEXA_API_KEY: apiKey },
  };
}

// Instructions that tell the AI to actually USE memory
const MNEMEXA_INSTRUCTIONS_MARKER = "## Mnemexa Memory";
const MNEMEXA_INSTRUCTIONS = `
## Mnemexa Memory — Mandatory Protocol

You have Mnemexa shared workspace memory via the \`brain.*\` tools. This is NOT optional.
Failure to use these tools wastes the user's tokens and money — they pay for memory
specifically so you don't re-derive context from scratch every conversation.

### Hard rules (non-negotiable)

1. **First action of every conversation:** call \`brain.recall\` with a query that summarizes
   the user's current ask. Do this BEFORE responding, even for greetings. If recall returns
   relevant memories, use them. If empty, proceed normally — but you MUST have made the call.

2. **Save on signal — call \`brain.remember\` immediately when the user:**
   - States a preference ("I prefer...", "I always...", "I never...", "use X not Y")
   - Shares a fact about themselves, their team, their company, their project
   - Makes a decision ("we're going with X", "the plan is Y", "we picked Z")
   - Reports a deadline, constraint, incident, or stakeholder
   - Corrects you ("no, actually...", "stop doing X", "that's wrong because...")
   - Confirms a non-obvious approach worked ("yes, that was the right call")

3. **Before saying "I don't know" or "I don't have context":** call \`brain.recall\` first.
   Only after recall returns empty should you ask the user.

4. **For broad / synthesis questions** ("what do we know about X?", "summarize Y",
   "give me everything about Z"): call \`brain.recall\` with a higher \`top_k\`
   (e.g. 10–15) and synthesize across the returned memories yourself.

5. **To verify the connection:** \`brain.status\` returns the workspace ID and health.

### Do NOT save
- Greetings, small talk, transient debugging output
- Code you just wrote (the diff is the record, not memory)
- Passwords, API keys, tokens, credit card numbers, secrets of any kind
- Information the user explicitly says is one-off or temporary

### Why this matters
Memory is shared across every agent on the workspace. One agent learns → every agent
knows on its very next call. Skipping these tools means every conversation starts from
zero, costs the user more tokens, and produces lower-quality answers. Use them.
`;

interface McpClient {
  name: string;
  configPath: string;
  serverKey: string; // dotted path supported, e.g. "mcp.servers"
  instructionsPath: string | null; // where AI reads its instructions (resolved value)
  resolveInstructionsPath?: () => string | null; // dynamic resolver, runs at install time
  requiresEnvKey?: boolean; // true => inject MNEMEXA_API_KEY into the MCP entry
  postInstallNote?: string; // shown after install (e.g. restart command)
}

// Read OpenClaw's configured workspace directory by parsing openclaw.json.
// Falls back to ~/.openclaw if unset or unreadable. The MEMORY.md filename is
// fixed by OpenClaw's bootstrap convention — only the parent dir varies.
function resolveOpenClawWorkspace(): string {
  const home = homedir();
  const configPath = join(home, ".openclaw", "openclaw.json");
  const fallback = join(home, ".openclaw");

  try {
    if (!existsSync(configPath)) return fallback;
    const raw = readFileSync(configPath, "utf-8");
    if (!raw.trim()) return fallback;
    const data = JSON.parse(raw);
    const ws = data?.agents?.defaults?.workspace;
    if (typeof ws === "string" && ws.length > 0) {
      // Expand ~ and resolve relative paths against home
      if (ws.startsWith("~/")) return join(home, ws.slice(2));
      if (ws === "~") return home;
      if (ws.startsWith("/")) return ws;
      return join(home, ws);
    }
  } catch {
    // fall through
  }
  return fallback;
}

function getKnownClients(): McpClient[] {
  const home = homedir();
  const os = platform();

  const clients: McpClient[] = [];

  // Claude Desktop
  if (os === "darwin") {
    clients.push({
      name: "Claude Desktop",
      configPath: join(home, "Library", "Application Support", "Claude", "claude_desktop_config.json"),
      serverKey: "mcpServers",
      instructionsPath: null, // Claude Desktop doesn't have a global instructions file
    });
  } else if (os === "linux") {
    clients.push({
      name: "Claude Desktop",
      configPath: join(home, ".config", "Claude", "claude_desktop_config.json"),
      serverKey: "mcpServers",
      instructionsPath: null,
    });
  } else if (os === "win32") {
    const appData = process.env.APPDATA || join(home, "AppData", "Roaming");
    clients.push({
      name: "Claude Desktop",
      configPath: join(appData, "Claude", "claude_desktop_config.json"),
      serverKey: "mcpServers",
      instructionsPath: null,
    });
  }

  // Claude Code
  clients.push({
    name: "Claude Code",
    configPath: join(home, ".claude.json"),
    serverKey: "mcpServers",
    instructionsPath: join(home, ".claude", "CLAUDE.md"),
  });

  // Cursor
  clients.push({
    name: "Cursor",
    configPath: join(home, ".cursor", "mcp.json"),
    serverKey: "mcpServers",
    instructionsPath: join(home, ".cursor", "rules", "mnemexa.mdc"),
  });

  // Windsurf
  clients.push({
    name: "Windsurf",
    configPath: join(home, ".codeium", "windsurf", "mcp_config.json"),
    serverKey: "mcpServers",
    instructionsPath: join(home, ".codeium", "windsurf", "memories", "mnemexa.md"),
  });

  // VS Code
  clients.push({
    name: "VS Code",
    configPath: join(home, ".vscode", "mcp.json"),
    serverKey: "servers",
    instructionsPath: null,
  });

  // OpenClaw — different shape (nested mcp.servers), needs explicit env, has its own
  // bootstrap convention: MEMORY.md inside the agent workspace dir auto-injected into
  // every system prompt. Workspace dir is read from openclaw.json at install time.
  clients.push({
    name: "OpenClaw",
    configPath: join(home, ".openclaw", "openclaw.json"),
    serverKey: "mcp.servers",
    instructionsPath: null, // resolved dynamically below
    resolveInstructionsPath: () => join(resolveOpenClawWorkspace(), "MEMORY.md"),
    requiresEnvKey: true,
    postInstallNote: "openclaw gateway restart",
  });

  return clients;
}

// Resolve a dotted key path inside an object, creating intermediate objects as needed.
// Returns the leaf object that the final key segment will be set on, plus that segment.
function resolveNestedKey(
  data: Record<string, unknown>,
  dottedKey: string,
): { container: Record<string, unknown>; leafKey: string } {
  const parts = dottedKey.split(".");
  let cursor: Record<string, unknown> = data;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!cursor[part] || typeof cursor[part] !== "object") {
      cursor[part] = {};
    }
    cursor = cursor[part] as Record<string, unknown>;
  }
  return { container: cursor, leafKey: parts[parts.length - 1] };
}

function detectInstalledClients(): McpClient[] {
  const all = getKnownClients();
  const detected: McpClient[] = [];

  for (const client of all) {
    const configDir = join(client.configPath, "..");
    if (existsSync(client.configPath) || existsSync(configDir)) {
      detected.push(client);
    }
  }

  return detected;
}

function isAlreadyConfigured(client: McpClient): boolean {
  try {
    if (!existsSync(client.configPath)) return false;
    const data = JSON.parse(readFileSync(client.configPath, "utf-8"));
    const { container, leafKey } = resolveNestedKey(data, client.serverKey);
    const servers = container[leafKey];
    return !!servers && typeof servers === "object" && "mnemexa" in (servers as object);
  } catch {
    return false;
  }
}

function addToClientConfig(client: McpClient, apiKey?: string): boolean {
  try {
    let data: Record<string, unknown> = {};

    if (existsSync(client.configPath)) {
      const raw = readFileSync(client.configPath, "utf-8");
      data = raw.trim() ? JSON.parse(raw) : {};
    } else {
      const configDir = join(client.configPath, "..");
      if (!existsSync(configDir)) {
        mkdirSync(configDir, { recursive: true });
      }
    }

    const { container, leafKey } = resolveNestedKey(data, client.serverKey);
    if (!container[leafKey] || typeof container[leafKey] !== "object") {
      container[leafKey] = {};
    }

    const entry = client.requiresEnvKey && apiKey
      ? buildMcpServerEntryWithEnv(apiKey)
      : MCP_SERVER_ENTRY;

    (container[leafKey] as Record<string, unknown>)["mnemexa"] = entry;

    writeFileSync(client.configPath, JSON.stringify(data, null, 2) + "\n", "utf-8");
    return true;
  } catch {
    return false;
  }
}

function getInstructionsPath(client: McpClient): string | null {
  if (client.resolveInstructionsPath) {
    return client.resolveInstructionsPath();
  }
  return client.instructionsPath;
}

function hasInstructions(client: McpClient): boolean {
  const path = getInstructionsPath(client);
  if (!path) return false;
  try {
    if (!existsSync(path)) return false;
    const content = readFileSync(path, "utf-8");
    return (
      content.includes(MNEMEXA_INSTRUCTIONS_MARKER) ||
      // Backward-compat: treat the legacy marker as already-installed so we don't
      // append a duplicate block on top of an existing v1 install.
      content.includes("## BizXEngine Memory")
    );
  } catch {
    return false;
  }
}

function injectInstructions(client: McpClient): boolean {
  const path = getInstructionsPath(client);
  if (!path) return false;

  try {
    const dir = join(path, "..");
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    let existing = "";
    if (existsSync(path)) {
      existing = readFileSync(path, "utf-8");

      // Already has instructions (new or legacy v1 marker)
      if (
        existing.includes(MNEMEXA_INSTRUCTIONS_MARKER) ||
        existing.includes("## BizXEngine Memory")
      ) {
        return true;
      }
    }

    // Append instructions
    const separator = existing.length > 0 && !existing.endsWith("\n") ? "\n" : "";
    writeFileSync(
      path,
      existing + separator + MNEMEXA_INSTRUCTIONS,
      "utf-8"
    );

    return true;
  } catch {
    return false;
  }
}

export function loadSavedApiKey(): string | undefined {
  // Prefer the new ~/.mnemexa path; fall back to the legacy ~/.bizxengine path so
  // users upgrading from @bizxengine/mcp v1 don't have to re-run setup.
  for (const file of [CONFIG_FILE, LEGACY_CONFIG_FILE]) {
    try {
      if (!existsSync(file)) continue;
      const data = JSON.parse(readFileSync(file, "utf-8"));
      if (data.apiKey) return data.apiKey;
    } catch {
      // try next candidate
    }
  }
  return undefined;
}

function saveApiKey(key: string): void {
  try {
    if (!existsSync(CONFIG_DIR)) {
      mkdirSync(CONFIG_DIR, { recursive: true });
    }
    writeFileSync(CONFIG_FILE, JSON.stringify({ apiKey: key }, null, 2), "utf-8");
  } catch {
    // silently fail — key still works for this session
  }
}

let sharedRl: ReturnType<typeof createInterface> | undefined;

function getReadline(): ReturnType<typeof createInterface> {
  if (!sharedRl) {
    sharedRl = createInterface({
      input: process.stdin,
      output: process.stderr,
    });
  }
  return sharedRl;
}

export function closeReadline(): void {
  if (sharedRl) {
    sharedRl.close();
    sharedRl = undefined;
  }
}

function prompt(question: string, defaultValue = ""): Promise<string> {
  const rl = getReadline();
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
    // If stdin closes before answer, resolve with default
    rl.once("close", () => resolve(defaultValue));
  });
}

export async function runInteractiveSetup(): Promise<string | undefined> {
  process.stderr.write(`\n`);
  process.stderr.write(`${yellow}${bold}  \u{1F510}  Mnemexa Setup${reset}\n`);
  process.stderr.write(`${dim}  ─────────────────────────────────────${reset}\n\n`);

  process.stderr.write(`${cyan}  Welcome! Let's connect your AI to Mnemexa.${reset}\n\n`);

  process.stderr.write(`  ${bold}Step 1${reset} ${dim}\u2192${reset} Open ${magenta}${bold}https://app.mnemexa.com${reset}\n`);
  process.stderr.write(`  ${bold}Step 2${reset} ${dim}\u2192${reset} Create or select your workspace\n`);
  process.stderr.write(`  ${bold}Step 3${reset} ${dim}\u2192${reset} Go to ${cyan}API Keys${reset}\n`);
  process.stderr.write(`  ${bold}Step 4${reset} ${dim}\u2192${reset} Generate a new key and paste it below\n\n`);

  const key = await prompt(`  ${green}${bold}\u2192 Paste your API key here: ${reset}`);

  if (!key) {
    process.stderr.write(`\n  ${yellow}No key entered. You can run this again anytime.${reset}\n\n`);
    closeReadline();
    return undefined;
  }

  saveApiKey(key);

  process.stderr.write(`\n  ${green}${bold}\u2714 API key saved!${reset}\n\n`);

  // --- Auto-configure AI tools ---
  await configureClients();

  closeReadline();
  return key;
}

async function configureClients(): Promise<void> {
  const detected = detectInstalledClients();

  if (detected.length === 0) {
    printManualConfig();
    return;
  }

  process.stderr.write(`  ${cyan}${bold}Detected AI tools on your system:${reset}\n\n`);

  const toConfigureList: McpClient[] = [];

  for (const client of detected) {
    if (isAlreadyConfigured(client)) {
      process.stderr.write(`    ${green}\u2714${reset} ${bold}${client.name}${reset} ${dim}already connected${reset}\n`);
    } else {
      process.stderr.write(`    ${cyan}\u2022${reset} ${bold}${client.name}${reset} ${dim}found${reset}\n`);
      toConfigureList.push(client);
    }
  }

  process.stderr.write(`\n`);

  if (toConfigureList.length === 0) {
    // Even if MCP is configured, check if instructions are missing
    await injectAllInstructions(detected);
    process.stderr.write(`  ${green}${bold}All detected tools are already connected!${reset}\n\n`);
    return;
  }

  const names = toConfigureList.length === 1
    ? toConfigureList[0].name
    : "all detected tools";

  const answer = await prompt(`  ${green}${bold}\u2192 Add Mnemexa to ${names}? (Y/n): ${reset}`, "y");

  const yes = !answer || answer.toLowerCase() === "y" || answer.toLowerCase() === "yes";

  if (!yes) {
    process.stderr.write(`\n`);
    printManualConfig();
    return;
  }

  process.stderr.write(`\n`);

  const apiKey = loadSavedApiKey();
  const configured: McpClient[] = [];

  for (const client of toConfigureList) {
    const ok = addToClientConfig(client, apiKey);
    if (ok) {
      process.stderr.write(`    ${green}${bold}\u2714${reset} ${bold}${client.name}${reset} ${green}MCP connected${reset}\n`);
      configured.push(client);
    } else {
      process.stderr.write(`    ${yellow}\u2717${reset} ${bold}${client.name}${reset} ${dim}could not write config${reset}\n`);
    }
  }

  process.stderr.write(`\n`);

  // Inject AI instructions into all successfully configured clients
  await injectAllInstructions(configured);

  // Per-client post-install notes (e.g. OpenClaw gateway restart)
  printPostInstallNotes(configured);

  // Tell user where to paste the protocol for clients that don't expose a global rules file
  printNoInstructionsFileNotice(configured);

  process.stderr.write(`  ${yellow}${bold}\u21BB Restart your AI tool to activate Mnemexa.${reset}\n\n`);
}

function printPostInstallNotes(clients: McpClient[]): void {
  const withNotes = clients.filter((c) => c.postInstallNote);
  if (withNotes.length === 0) return;

  for (const client of withNotes) {
    process.stderr.write(`  ${yellow}\u2192${reset} ${bold}${client.name}:${reset} run ${cyan}${client.postInstallNote}${reset} to pick up the new server\n`);
  }
  process.stderr.write(`\n`);
}

function printNoInstructionsFileNotice(clients: McpClient[]): void {
  const noRulesFile = clients.filter((c) => !getInstructionsPath(c));
  if (noRulesFile.length === 0) return;

  const names = noRulesFile.map((c) => c.name).join(", ");
  process.stderr.write(`  ${yellow}\u26A0  ${bold}${names}${reset} ${yellow}has no global rules file.${reset}\n`);
  process.stderr.write(`     ${dim}Open ${magenta}https://mnemexa.com/setup#protocol${reset}${dim} and paste the${reset}\n`);
  process.stderr.write(`     ${dim}\"Agent Protocol\" block into your AI's system prompt \u2014 without it,${reset}\n`);
  process.stderr.write(`     ${dim}the agent has the tools but won't proactively use them.${reset}\n\n`);
}

async function injectAllInstructions(clients: McpClient[]): Promise<void> {
  const needsInstructions = clients.filter(
    (c) => getInstructionsPath(c) && !hasInstructions(c)
  );

  if (needsInstructions.length === 0) return;

  for (const client of needsInstructions) {
    const ok = injectInstructions(client);
    if (ok) {
      process.stderr.write(`    ${green}${bold}\u2714${reset} ${bold}${client.name}${reset} ${green}memory instructions added${reset}\n`);
    }
  }

  process.stderr.write(`\n`);
  process.stderr.write(`  ${dim}Your AI will now proactively remember and recall information.${reset}\n\n`);
}

function printManualConfig(): void {
  process.stderr.write(`  ${dim}To connect manually, add this to your AI tool's MCP config:${reset}\n\n`);
  process.stderr.write(`  ${cyan}${bold}{${reset}\n`);
  process.stderr.write(`  ${cyan}${bold}  "mcpServers": {${reset}\n`);
  process.stderr.write(`  ${cyan}${bold}    "mnemexa": {${reset}\n`);
  process.stderr.write(`  ${cyan}${bold}      "command": "npx",${reset}\n`);
  process.stderr.write(`  ${cyan}${bold}      "args": ["-y", "@mnemexa/mcp"]${reset}\n`);
  process.stderr.write(`  ${cyan}${bold}    }${reset}\n`);
  process.stderr.write(`  ${cyan}${bold}  }${reset}\n`);
  process.stderr.write(`  ${cyan}${bold}}${reset}\n\n`);
  process.stderr.write(`  ${dim}Works with Claude, Cursor, Windsurf, VS Code, and any MCP-compatible tool.${reset}\n\n`);
}

export function runSilentInstall(apiKey: string): boolean {
  const key = apiKey.trim();
  if (!key) {
    process.stderr.write(`  ${yellow}No API key provided.${reset}\n\n`);
    return false;
  }

  // 1. Save key
  saveApiKey(key);
  process.stderr.write(`  ${green}${bold}\u2714${reset} API key saved\n`);

  // 2. Auto-configure all detected clients
  const detected = detectInstalledClients();
  let anyConfigured = false;
  const successfullyConfigured: McpClient[] = [];

  for (const client of detected) {
    if (isAlreadyConfigured(client)) {
      process.stderr.write(`  ${green}${bold}\u2714${reset} ${bold}${client.name}${reset} ${dim}already connected${reset}\n`);
      anyConfigured = true;
      successfullyConfigured.push(client);
    } else {
      const ok = addToClientConfig(client, key);
      if (ok) {
        process.stderr.write(`  ${green}${bold}\u2714${reset} ${bold}${client.name}${reset} ${green}MCP connected${reset}\n`);
        anyConfigured = true;
        successfullyConfigured.push(client);
      }
    }
  }

  // 3. Inject AI instructions
  for (const client of detected) {
    if (getInstructionsPath(client) && !hasInstructions(client)) {
      const ok = injectInstructions(client);
      if (ok) {
        process.stderr.write(`  ${green}${bold}\u2714${reset} ${bold}${client.name}${reset} ${green}memory instructions added${reset}\n`);
      }
    }
  }

  if (!anyConfigured && detected.length === 0) {
    printManualConfig();
  }

  process.stderr.write(`\n`);

  // Post-install notes + protocol-paste hints for tools without a rules file
  printPostInstallNotes(successfullyConfigured);
  printNoInstructionsFileNotice(successfullyConfigured);

  return true;
}

export function resolveApiKey(): string | undefined {
  // Prefer MNEMEXA_API_KEY; accept BIZX_API_KEY as a backward-compat fallback for users
  // who set the env var under the legacy name.
  return (
    process.env.MNEMEXA_API_KEY ||
    process.env.BIZX_API_KEY ||
    loadSavedApiKey() ||
    undefined
  );
}
