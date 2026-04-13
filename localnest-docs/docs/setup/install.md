# Installation

<div className="docPanel docPanel--compact">
  <p>
    The recommended path is a global install followed by setup and doctor. LocalNest <strong>v0.3.0</strong>
    is a modernization release that introduces a premium CLI with an interactive TUI dashboard. 
    It features <strong>74 MCP tools</strong> across temporal knowledge graph, multi-hop traversal, 
    and agent-scoped memory tracks.
  </p>
</div>

## Requirements

- **Node.js >=18**: Required for core search and file tools.
- **Node.js >=22**: **Recommended.** Required for the local memory subsystem and TUI dashboard.
- **ripgrep (rg)**: Highly recommended for high-performance lexical search.

:::tip Memory Requirement
If you are using the memory subsystem, ensure you are on **Node 22.13.1** or higher to support the underlying SQLite-vec extensions.
:::

## Recommended Install

Choose your release track:

**Stable Track (v0.2.0):**
```bash
npm install -g localnest-mcp
```

**Beta Track (v0.3.0-beta.1 — Interactive CLI & TUI):**
```bash
npm install -g localnest-mcp@beta
```

## Quick Start Sequence

```bash
# 1. Install the package (Stable or Beta)
npm install -g localnest-mcp

# 2. Install bundled skills to your AI clients
localnest install skills

# 3. Generate configuration & Provision backends
localnest setup

# 4. Verify the environment & Diagnostics
localnest doctor

# 5. Launch the Dashboard (Beta only)
localnest dashboard
```

## Bundled Skill Targets

`localnest install skills` installs tool-specific skill packages from one canonical LocalNest skill source.

It automatically detects and installs to:
- `~/.cursor/skills`
- `~/.codeium/windsurf/skills`
- `~/.gemini/antigravity/skills`
- `~/.cline/skills`
- `~/.continue/skills`
- `~/.agents/skills`

## MCP Client Config

After setup, copy the `mcpServers` block from `~/.localnest/config/mcp.localnest.json` into your client configuration.

```json
{
  "mcpServers": {
    "localnest": {
      "command": "localnest-mcp",
      "startup_timeout_sec": 30,
      "env": {
        "MCP_MODE": "stdio",
        "LOCALNEST_CONFIG": "~/.localnest/config/localnest.config.json",
        "LOCALNEST_INDEX_BACKEND": "sqlite-vec",
        "LOCALNEST_MEMORY_ENABLED": "true"
      }
    }
  }
}
```

## Troubleshooting

- **Startup Timeout**: Keep `startup_timeout_sec` at `30` or higher.
- **Diagnostics**: Run `localnest doctor --verbose` for a full health scan.
- **Model Warmup**: Setup downloads embedding models to `~/.localnest/cache`. Ensure this path is writable.
- **Beta Features**: If `localnest dashboard` is not found, ensure you installed `@beta`.

---

> **Note on v0.3.0**: The modernization cycle focuses on premium developer experience. All tool names and API contracts from 0.1.0/0.2.0 are fully preserved.
