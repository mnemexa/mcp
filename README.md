<div align="center">

<br/>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/banner.svg">
  <source media="(prefers-color-scheme: light)" srcset="assets/banner.svg">
  <img alt="Mnemexa MCP" src="assets/banner.svg" width="100%">
</picture>

<br/>

<p>
  <strong>The intelligence layer for AI that never forgets.</strong>
</p>

<p>
  <a href="https://www.npmjs.com/package/@mnemexa/mcp"><img src="https://img.shields.io/npm/v/@mnemexa/mcp.svg?style=flat-square&color=38BDF8&labelColor=0a0a0a&label=npm" alt="npm version"></a>
  &nbsp;
  <a href="https://opensource.org/licenses/ISC"><img src="https://img.shields.io/badge/license-ISC-38BDF8?style=flat-square&labelColor=0a0a0a" alt="License: ISC"></a>
  &nbsp;
  <img src="https://img.shields.io/badge/node-%3E%3D18-38BDF8?style=flat-square&labelColor=0a0a0a" alt="Node 18+">
  &nbsp;
  <img src="https://img.shields.io/badge/MCP-compatible-38BDF8?style=flat-square&labelColor=0a0a0a" alt="MCP Compatible">
</p>

<p>
  <a href="https://app.mnemexa.com">Dashboard</a>&nbsp;&nbsp;&bull;&nbsp;&nbsp;<a href="https://mnemexa.com">Website</a>&nbsp;&nbsp;&bull;&nbsp;&nbsp;<a href="https://docs.mnemexa.com">Docs</a>&nbsp;&nbsp;&bull;&nbsp;&nbsp;<a href="https://www.npmjs.com/package/@mnemexa/mcp">npm</a>
</p>

<br/>

</div>

---

<br/>

<h2>The Problem</h2>

Every time you start a new conversation with your AI:

- It forgets who you are
- It forgets your project context
- It forgets decisions you already made
- It asks the same questions again
- Your team's agents can't share knowledge

<br/>

> **Your AI has amnesia. Mnemexa gives it a brain.**

<br/>

---

<br/>

<h2>What This Is</h2>

Mnemexa is the **Intelligent Memory OS for AI**. This package is the MCP adapter — it connects any MCP-compatible IDE or agent runtime to Mnemexa's cloud memory engine via four tool calls your AI uses automatically.

Once installed, your AI agent:

- **Remembers** preferences, decisions, and project context across every conversation
- **Recalls** relevant facts before answering — without being told to look
- **Shares memory** with other agents on the same workspace in real time
- **Self-optimizes** — importance scoring, deduplication, and temporal decay happen automatically in the cloud

No prompt engineering. No manual context pasting. Your AI just gets smarter the more you use it.

<br/>

---

<br/>

<h2>Install</h2>

```bash
npx @mnemexa/mcp
```

The installer detects your AI tools and configures everything — API key storage, MCP server registration, and memory behaviour instructions injected directly into your IDE's rules file.

**You need a Mnemexa API key.** Get one free at [app.mnemexa.com](https://app.mnemexa.com) — no credit card required to start.

<details>
<summary><strong>Silent install</strong> — CI, scripts, or AI-assisted setup</summary>

<br/>

```bash
npx @mnemexa/mcp --install YOUR_API_KEY
```

Saves the key, configures all detected AI tools, and exits. Suitable for automated provisioning or letting your AI install it on your behalf.

</details>

<br/>

---

<br/>

<h2>Try It in 10 Seconds</h2>

Once installed, open your AI and try this:

```
> What is your status?
```

```
> Remember that this client prefers LinkedIn over Instagram.
```

```
> What do we know about this client?
```

That's it. Your AI now has persistent, self-optimizing memory.

<br/>

---

<br/>

<h2>Architecture</h2>

<br/>

<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/architecture.svg">
    <source media="(prefers-color-scheme: light)" srcset="assets/architecture.svg">
    <img alt="Mnemexa Architecture" src="assets/architecture.svg" width="100%">
  </picture>
</div>

<br/>

This package is a **thin stdio adapter** — roughly 1,200 lines of TypeScript with no business logic. All intelligence (scoring, deduplication, decay) runs in Mnemexa's cloud. The adapter's only jobs are: resolve the API key, translate MCP tool calls into REST requests, and return formatted results.

<br/>

---

<br/>

<h2>Tools</h2>

Your AI gets these capabilities out of the box:

| Tool | What it does |
|:-----|:-------------|
| `brain.remember` | Save important information — auto-scored for importance, deduplicated, categorized |
| `brain.recall` | Semantic search over your memory store — returns ranked, scored results |
| `brain.health` | Memory quality report — health score, total count, stale signals |
| `brain.status` | Live connection check — confirms the workspace is reachable |

<br/>

---

<br/>

<h2>Multi-Agent Memory</h2>

<p><em>Give your entire AI team a shared brain.</em></p>

<br/>

<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/multi-agent.svg">
    <source media="(prefers-color-scheme: light)" srcset="assets/multi-agent.svg">
    <img alt="Multi-Agent Shared Intelligence" src="assets/multi-agent.svg" width="100%">
  </picture>
</div>

<br/>

Same API key = same workspace = **shared intelligence.**

```bash
# Agent 1 — your machine
npx @mnemexa/mcp --install mnx_workspace_key

# Agent 2 — teammate's machine
npx @mnemexa/mcp --install mnx_workspace_key

# Agent 3 — CI / automation
npx @mnemexa/mcp --install mnx_workspace_key
```

One agent learns a client prefers morning meetings. Every other agent on the workspace knows it immediately. No Slack messages. No copy-pasting context. No documentation you'll forget to update.

<br/>

---

<br/>

<h2>How the Memory Engine Works</h2>

The intelligence is in Mnemexa's cloud, not this adapter. When a memory is stored, it passes through a multi-stage pipeline:

```
Input text
  → PII detection (passwords, API keys, card numbers filtered out)
  → Noise filtering (greetings, small talk discarded)
  → Semantic deduplication (near-duplicates merged, not doubled)
  → Importance scoring 1–10 (LLM-assessed business value)
  → Temporal classification (deadline vs permanent fact)
  → Auto-categorization (domain tags assigned)
  → pgvector storage with HNSW index
```

When a memory is retrieved, it's ranked by a four-factor hybrid score:

```
Final score = (semantic similarity × 0.55)
            + (recency                × 0.20)
            + (business importance    × 0.15)
            + (access frequency       × 0.10)
            × temporal decay multiplier
```

Expired time-bound memories drop to 5% relevance automatically. High-importance persistent memories never decay. Your agents always surface what's current and relevant — not whatever happens to be semantically closest.

> Your AI doesn't just store text. **It builds understanding.**

<br/>

---

<br/>

<h2>Why Mnemexa?</h2>

| Feature | Naive Vector Store | LangChain / Custom RAG | **Mnemexa** |
|:--------|:--:|:--:|:--:|
| Persistent across sessions | Yes | Yes | **Yes** |
| Importance-weighted retrieval | — | — | **Yes** |
| Temporal decay | — | — | **Yes** |
| LLM deduplication | — | — | **Yes** |
| Shared team / swarm memory | — | — | **Yes** |
| PII filtering | — | — | **Yes** |
| Self-optimizing health | — | — | **Yes** |
| Auto-categorization | — | — | **Yes** |
| One-line MCP install | — | — | **Yes** |

Mnemexa isn't a key-value store. It's an **intelligence layer** that learns what matters, forgets what doesn't, and gets smarter over time.

<br/>

---

<br/>

<h2>Use Cases</h2>

<table>
<tr>
<td width="50%">

**Personal AI Memory**

> *"Remember that I prefer TypeScript and always use Tailwind."*

Next conversation, your AI already knows.

</td>
<td width="50%">

**Project Context**

> *"We decided PostgreSQL over MongoDB for billing."*

Weeks later, your AI recalls the decision and why.

</td>
</tr>
<tr>
<td width="50%">

**Client Work**

> *"This client prefers formal communication, timezone EST."*

Every agent remembers this for every future interaction.

</td>
<td width="50%">

**Agent Onboarding**

Spin up a new agent with the workspace key — it instantly knows everything the team has learned.

</td>
</tr>
</table>

<br/>

---

<br/>

<h2>Setup by Tool</h2>

### Claude Code

Claude Code reads MCP configuration from `~/.claude.json` and picks up memory instructions from `~/.claude/CLAUDE.md`. The installer handles both automatically.

**Automatic (recommended):**

```bash
npx @mnemexa/mcp
```

**Manual:**

```bash
claude mcp add mnemexa npx @mnemexa/mcp -- --api-key mnx_your_key_here
```

Or add directly to `~/.claude.json`:

```json
{
  "mcpServers": {
    "mnemexa": {
      "command": "npx",
      "args": ["-y", "@mnemexa/mcp"],
      "env": {
        "MNEMEXA_API_KEY": "mnx_your_key_here"
      }
    }
  }
}
```

---

### Claude Desktop

**Automatic (recommended):**

```bash
npx @mnemexa/mcp
```

**Manual** — add to your Claude Desktop config file:

| OS | Config path |
|:---|:------------|
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |
| Linux | `~/.config/Claude/claude_desktop_config.json` |

```json
{
  "mcpServers": {
    "mnemexa": {
      "command": "npx",
      "args": ["-y", "@mnemexa/mcp"],
      "env": {
        "MNEMEXA_API_KEY": "mnx_your_key_here"
      }
    }
  }
}
```

Restart Claude Desktop after saving.

---

### Cursor

**Automatic (recommended):**

```bash
npx @mnemexa/mcp
```

**Manual** — add to `~/.cursor/mcp.json` (global) or `.cursor/mcp.json` in your project root (project-scoped):

```json
{
  "mcpServers": {
    "mnemexa": {
      "command": "npx",
      "args": ["-y", "@mnemexa/mcp"],
      "env": {
        "MNEMEXA_API_KEY": "mnx_your_key_here"
      }
    }
  }
}
```

The installer also writes memory-use rules to `~/.cursor/rules/mnemexa.mdc` so Cursor's agent uses memory proactively across all projects.

---

### Windsurf

**Automatic (recommended):**

```bash
npx @mnemexa/mcp
```

**Manual** — add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "mnemexa": {
      "command": "npx",
      "args": ["-y", "@mnemexa/mcp"],
      "env": {
        "MNEMEXA_API_KEY": "mnx_your_key_here"
      }
    }
  }
}
```

---

### VS Code

**Manual** — add to `~/.vscode/mcp.json`:

```json
{
  "servers": {
    "mnemexa": {
      "command": "npx",
      "args": ["-y", "@mnemexa/mcp"],
      "env": {
        "MNEMEXA_API_KEY": "mnx_your_key_here"
      }
    }
  }
}
```

---

### OpenClaw

[OpenClaw](https://github.com/openclaw/openclaw) is an open-source autonomous agent framework that runs on your machine and operates via Telegram, Discord, WhatsApp, or Slack — a programmable digital worker that executes tasks autonomously across your apps and workflows.

**Why Mnemexa + OpenClaw:**

OpenClaw's core design is multi-agent. Developers build swarms where one agent plans, others execute specialized tasks, and results are combined. But OpenClaw's built-in memory is local and per-machine. The moment you run a second agent on a different machine or channel, those memories are siloed.

Mnemexa replaces that with **shared workspace memory**. Every agent in your OpenClaw swarm reads from and writes to the same memory pool — regardless of which machine, channel, or LLM provider they run on. One agent learns something. Every other agent knows it immediately.

> **OpenClaw does not inherit MCP servers from your IDE configs.** Even after `npx @mnemexa/mcp --install` writes `~/.cursor/mcp.json`, `~/.claude/settings.json`, etc., OpenClaw agents will still report `No MCP server named "mnemexa"`. OpenClaw reads only its own `~/.openclaw/openclaw.json` — you must register `mnemexa` there explicitly. A successful `mcporter call 'mnemexa.brain.status()'` proves the MCP adapter works on the machine; it does **not** prove OpenClaw can see it.

**Setup** — add to `~/.openclaw/openclaw.json`:

```json
{
  "mcp": {
    "servers": {
      "mnemexa": {
        "command": "npx",
        "args": ["-y", "@mnemexa/mcp"],
        "env": {
          "MNEMEXA_API_KEY": "mnx_your_key_here"
        }
      }
    }
  }
}
```

Then restart your gateway:

```bash
openclaw gateway restart
```

**For multi-agent swarms** — use the same workspace key across every agent instance. One key. Shared memory. Every agent in the swarm stays in sync automatically.

> Running per-agent MCP routing in OpenClaw? Add the `mnemexa` server to each agent's `mcpServers` override. Agents without an override inherit the global server list.

**Verify against OpenClaw's runtime** — not just `mcporter`:

```bash
openclaw mcp list                  # mnemexa must appear
openclaw mcp show mnemexa          # confirms config in ~/.openclaw/openclaw.json
```

Then trigger a real tool call *through an OpenClaw agent* — e.g. ask the agent "What is your Mnemexa status?" and confirm it invokes `brain.status` and returns a successful response. If `mcporter` works but `openclaw mcp list` doesn't show `mnemexa`, the OpenClaw config is missing — re-check Step 1 above and run `openclaw gateway restart`.

<br/>

---

<br/>

<h2>The One Thing Worth Adding to Your Agent Instructions</h2>

The installer injects memory-use instructions automatically for most tools. But the single most impactful thing you can do is add one line to your agent's system prompt or rules file:

> *Use Mnemexa as your persistent memory — store important decisions, preferences, and context as you learn them, and retrieve relevant memory at the start of every conversation. Everything else is handled automatically.*

That's it. Your agent now has fully intelligent, self-managing memory.

<br/>

---

<br/>

<h2>What Gets Installed</h2>

The installer automatically configures everything:

| Step | What happens |
|:-----|:-------------|
| **1** | Saves your API key to `~/.mnemexa/config.json` |
| **2** | Adds Mnemexa MCP server to your AI tool's config |
| **3** | Injects memory instructions so your AI uses memory proactively |

<br/>

**Auto-detected AI tools:**

<p>
  <img src="https://img.shields.io/badge/Claude_Code-38BDF8?style=flat-square&labelColor=0a0a0a" alt="Claude Code">
  &nbsp;
  <img src="https://img.shields.io/badge/Claude_Desktop-38BDF8?style=flat-square&labelColor=0a0a0a" alt="Claude Desktop">
  &nbsp;
  <img src="https://img.shields.io/badge/Cursor-38BDF8?style=flat-square&labelColor=0a0a0a" alt="Cursor">
  &nbsp;
  <img src="https://img.shields.io/badge/Windsurf-38BDF8?style=flat-square&labelColor=0a0a0a" alt="Windsurf">
  &nbsp;
  <img src="https://img.shields.io/badge/VS_Code-38BDF8?style=flat-square&labelColor=0a0a0a" alt="VS Code">
  &nbsp;
  <img src="https://img.shields.io/badge/OpenClaw-38BDF8?style=flat-square&labelColor=0a0a0a" alt="OpenClaw">
</p>

Any MCP-compatible host (including custom agent runtimes) works with manual configuration.

<br/>

---

<br/>

<h2>Security</h2>

| | |
|:--|:--|
| **API keys** | Stored locally in `~/.mnemexa/config.json` — never logged, transmitted in URLs, or included in error output |
| **Transport** | All API calls use HTTPS only — enforced at startup. HTTP overrides are rejected |
| **Isolation** | The adapter never connects to any database directly — only `api.mnemexa.com` REST endpoints |
| **Error handling** | Internal errors and stack traces are never forwarded to the AI or shown in tool output |
| **Retries** | Only on transient server-side failures (502/503/504), never on 4xx responses |

<br/>

---

<br/>

<h2>Environment Variables</h2>

| Variable | Default | Description |
|:---------|:--------|:------------|
| `MNEMEXA_API_KEY` | — | Workspace API key. Auto-loaded from `~/.mnemexa/config.json` if the CLI installer was used. |
| `MNEMEXA_BASE_URL` | `https://api.mnemexa.com` | API base URL override. HTTPS required. |

<br/>

---

<br/>

<h2>Troubleshooting</h2>

<details>
<summary><strong>"Not connected" after install</strong></summary>

<br/>

Restart your AI tool after running the installer. MCP servers are loaded at startup.

</details>

<details>
<summary><strong>"Invalid API key" on every call</strong></summary>

<br/>

Check that `MNEMEXA_API_KEY` is set in your MCP config's `env` block, or that `~/.mnemexa/config.json` contains your key. Regenerate your key at [app.mnemexa.com](https://app.mnemexa.com) if needed.

</details>

<details>
<summary><strong>Tools not appearing in my IDE</strong></summary>

<br/>

Verify the MCP server block is under the correct key for your tool: `mcpServers` for Claude and Cursor, `servers` for VS Code, `mcp.servers` for OpenClaw.

</details>

<details>
<summary><strong>Memory not persisting between conversations</strong></summary>

<br/>

Confirm all agents are using the same workspace API key. Each workspace is isolated — a personal key and a team key are different memory pools.

</details>

<details>
<summary><strong>OpenClaw agents not sharing memory</strong></summary>

<br/>

Confirm all agents in `~/.openclaw/openclaw.json` use the same `MNEMEXA_API_KEY`. Run `openclaw gateway restart` after any config change.

</details>

<br/>

---

<br/>

<h2>Requirements</h2>

- Node.js 18 or later
- A Mnemexa workspace and API key — [create one free](https://app.mnemexa.com)

<br/>

---

<br/>

<h2>Built With</h2>

<p>
  <img src="https://img.shields.io/badge/Model_Context_Protocol-MCP-38BDF8?style=flat-square&labelColor=0a0a0a" alt="MCP">
  &nbsp;
  <img src="https://img.shields.io/badge/TypeScript-strict-38BDF8?style=flat-square&labelColor=0a0a0a" alt="TypeScript">
  &nbsp;
  <img src="https://img.shields.io/badge/Node.js-18+-38BDF8?style=flat-square&labelColor=0a0a0a" alt="Node.js">
  &nbsp;
  <img src="https://img.shields.io/badge/Zero_deps-beyond_MCP_SDK-38BDF8?style=flat-square&labelColor=0a0a0a" alt="Zero deps">
</p>

<br/>

---

<br/>

<div align="center">

<br/>

<strong>Stop teaching your AI the same things twice.</strong>

<br/><br/>

<a href="https://app.mnemexa.com">
  <img src="https://img.shields.io/badge/Get_Your_API_Key-38BDF8?style=for-the-badge&labelColor=0a0a0a&color=38BDF8" alt="Get Your API Key">
</a>

<br/><br/>

<p>
  <a href="https://app.mnemexa.com">Dashboard</a>&nbsp;&nbsp;&bull;&nbsp;&nbsp;<a href="https://mnemexa.com">Website</a>&nbsp;&nbsp;&bull;&nbsp;&nbsp;<a href="https://docs.mnemexa.com">Docs</a>&nbsp;&nbsp;&bull;&nbsp;&nbsp;<a href="https://www.npmjs.com/package/@mnemexa/mcp">npm</a>
</p>

<sub>Built by <a href="https://mnemexa.com">Mnemexa</a> — The Intelligent Memory OS for AI</sub>

<br/><br/>

</div>
