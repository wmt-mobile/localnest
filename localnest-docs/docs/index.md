---
slug: /
sidebar_position: 1
title: Getting Started
---

# Getting Started

LocalNest is a local-first MCP server that gives AI agents safe, scoped access to your codebase — with hybrid search, semantic indexing, a temporal knowledge graph, and persistent memory that never leaves your machine.

**52 MCP tools. Zero cloud dependencies. Pure SQLite.**

## Quick start

```bash
npm install -g localnest-mcp
localnest setup
localnest doctor
```

Then paste the generated `mcpServers.localnest` block into your MCP client config (Cursor, Windsurf, Codex, Kiro, Gemini CLI, or any MCP-compatible client).

## What you get

| Capability | What it does |
|---|---|
| **Hybrid search** | Lexical + semantic fused with RRF ranking |
| **Knowledge graph** | Temporal triples with `as_of` queries and multi-hop traversal |
| **Agent memory** | Durable, queryable knowledge that persists across sessions |
| **Semantic dedup** | Embedding similarity gate prevents near-duplicate pollution |
| **Conversation ingestion** | Import Markdown/JSON chat exports with entity extraction |
| **Hooks** | Pre/post operation callbacks for memory, KG, traversal |

## Next steps

- **[Install](/docs/setup/install)** — full install walkthrough with skill setup and doctor checks
- **[Configuration](/docs/setup/configuration)** — roots, env vars, index backends, memory toggle
- **[Architecture](/docs/architecture)** — boot flow, retrieval pipeline, memory graph internals
- **[Tools](/docs/tools/overview)** — all 52 MCP tools across 11 groups
- **[Current Release](/docs/releases/current)** — what changed in 0.1.0
