---
slug: /
sidebar_position: 1
title: Welcome to LocalNest
---

# LocalNest MCP

**Local-first AI Context, Semantic Code Search, and Persistent Memory.**

LocalNest is a powerful MCP server that gives your AI agents a durable "nest" on your machine. It combines context-aware code discovery with a temporal knowledge graph, ensuring your AI never loses the thread of a conversation or a codebase.

![LocalNest TUI Dashboard](/img/tui-dashboard.png)

## ⚡ Quick Start

Choose your release track and get started in seconds:

| Track | Install Command | Best for... |
|---|---|---|
| **Stable** | `npm install -g localnest-mcp` | Production reliability & 74 core tools. |
| **Beta** | `npm install -g localnest-mcp@beta` | **Modern TUI Dashboard** & Premium UI. |

Then initialize your environment:
```bash
localnest setup
localnest doctor
```

---

## 🏗️ Core Pillars

:::info Key Value
LocalNest is built for **100% privacy**. No data leaves your machine—embeddings, index, and memory stay local.
:::

- **[74 Specialized Tools](/docs/tools/overview)**: Comprehensive coverage for search, memory, and graph traversal.
- **[Interactive TUI Dashboard](/docs/tools/cli)**: Real-time monitoring of your knowledge base state.
- **[Temporal Knowledge Graph](/docs/tools/knowledge-graph)**: Subject-predicate-object triples with time-validity (`as_of`).
- **[Fused Retrieval](/docs/tools/search)**: Lexical + semantic fused with RRF ranking for high-precision results.
- **[Agent Isolation](/docs/tools/organization)**: Per-agent diary and memory scoping to prevent contamination.

---

## 🚦 Next Steps

<div className="container">
  <div className="row">
    <div className="col col--6">
      ### 🏁 [Getting Started](/docs/setup/install)
      Full walkthrough for installing and connecting to your favorite AI client.
    </div>
    <div className="col col--6">
      ### 🧱 [Tool Reference](/docs/tools/overview)
      Deep dive into the 74 tools available for your AI agents.
    </div>
  </div>
  <div className="row">
    <div className="col col--6">
      ### 🧬 [Architecture](/docs/architecture)
      Understand the retrieval pipeline and memory graph internals.
    </div>
    <div className="col col--6">
      ### 🚀 [Release Notes](/docs/releases/current)
      What's new in the latest v0.3.0-beta.1 modernization update.
    </div>
  </div>
</div>

---

<p align="center">
  <b>Empower your AI. Own your Context.</b>
</p>
