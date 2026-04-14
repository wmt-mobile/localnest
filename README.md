# LocalNest MCP — Private AI Context & Persistent Memory

[![stable](https://img.shields.io/npm/v/localnest-mcp?label=stable)](https://www.npmjs.com/package/localnest-mcp)
[![beta](https://img.shields.io/npm/v/localnest-mcp/beta?label=beta)](https://www.npmjs.com/package/localnest-mcp/v/beta)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Quality](https://github.com/wmt-mobile/localnest/actions/workflows/quality.yml/badge.svg?branch=beta)](https://github.com/wmt-mobile/localnest/actions/workflows/quality.yml)

**LocalNest** is the world’s first local-first MCP server that combines **Semantic Code Search**, **Persistent AI Memory**, and a **Temporal Knowledge Graph**. It enables your AI agents to build a "nest" of knowledge directly on your machine—ensuring privacy, speed, and cross-session intelligence without cloud dependencies.


---

## ⚡ Quick Start

### 1. Install
```bash
# Stable Track
npm install -g localnest-mcp

# Beta Track
npm install -g localnest-mcp@beta
```

After install, enable semantic search (embeddings):
```bash
cd $(npm root -g)/localnest-mcp && npm install --no-save @huggingface/transformers
```

> **Installing from GitHub?** See the [Troubleshooting](#-troubleshooting) section below.

### 2. Initialize
```bash
localnest setup
localnest dashboard  # Open the interactive TUI (Beta only)
```

---

## 🏗️ Core Features

- 🧠 **Persistent Memory**: Your AI remembers decisions, bug fixes, and preferences across sessions.
- 📂 **Semantic Search**: Instant, AST-aware code retrieval using local vector embeddings (SQLite-vec).
- 🕸️ **Knowledge Graph**: A temporal subject-predicate-object graph for complex relationship mapping.
- 🛠️ **74 MCP Tools**: A comprehensive suite for file discovery, code intelligence, and memory management.
- 🔒 **Privacy First**: Zero cloud calls. All embeddings and data stay on your local disk.
- 🛸 **Interactive TUI**: A premium Terminal Dashboard for real-time monitoring of your knowledge base.

---

1. [Installation & Setup](#-quick-start)
2. [Release Tracks](#-release-tracks)
3. [Tool Suites](#-tool-suites)
4. [Agentic Workflows](#-how-agents-use-it)
5. [Comparison Matrix](#-how-localnest-compares)
6. [Security & Quality](#-security)
7. [Full Documentation](https://wmt-mobile.github.io/localnest/)

## 🚀 Release Tracks

LocalNest maintains two active tracks to balance proven stability with rapid innovation.

- **Stable (v0.2.0)**: Use for production-critical workflows. Focused on core stability and 74 tool reliability.
- **Beta (v0.3.0-beta.1)**: Use for the **Modernization Update**. Includes the premium interactive TUI Dashboard, refactored diagnostics, and Expert SOP steering.

---

## 🔧 Tool Suites

LocalNest provides **74 specialized tools** categorized for agentic efficiency. For a full parameter reference, visit the **[Tool Documentation](https://wmt-mobile.github.io/localnest/docs/tools/overview)**.

- **Workspace**: File discovery, project summarization, and scoped reading.
- **Intelligence**: Symbol callers, definitions, implementations, and rename previews.
- **Retrieval**: Fused lexical/semantic search with RRF ranking.
- **Memory**: Task context, recall, outcomes, and behavior modifiers (`teach`).
- **Graph**: Multi-hop traversal, entity management, and temporal queries.
- **Batch**: High-speed bulk operations (up to 500 records per call).

---

## 🤖 How Agents Use It

LocalNest is designed to be the "one-stop-shop" for AI context.

- **Cold Start**: `agent_prime` returns memories + entities + files + changes in one call.
- **Task Execution**: `find` searches everything simultaneously to find the "needle in the haystack".
- **Learning**: `teach` allows you to set persistent coding standards that the agent never forgets.
- **Self-Audit**: `audit` scores the health of the agent's knowledge base.

---

## 📊 How LocalNest Compares

| Capability | **LocalNest** | MemPalace | Zep | Mem0 |
|---|---|---|---|---|
| **Local-first** | **Yes** | Yes | No | No |
| **Code Search** | **74 Tools** | None | None | None |
| **Graph Type** | **Temporal (SQLite)** | Flat | Neo4j | Key-Value |
| **Traversal** | **Multi-hop** | No | No | No |
| **Batch Ops** | **Yes** | No | No | No |
| **TUI Dashboard** | **Yes (Beta)** | No | No | No |

---

## 🛡️ Security

LocalNest follows the OSS security pipeline exactly:

- **CI/CD Quality**: Verified via GitHub Actions.
- **Static Analysis**: Continuous CodeQL scanning.
- **Transparency**: OpenSSF Scorecard and Dependabot enabled.
- **Compliance**: MIT Licensed and 100% Open Source.

---

## 🔍 Troubleshooting

### Installing from GitHub (git+https://)

Direct `npm install -g git+https://...` may fail with `TAR_ENTRY_ERRORS` or `spawn sh ENOENT`. This is a [known npm limitation](https://github.com/npm/cli/issues/3910) where git dependencies auto-bundle `node_modules` into the tarball, causing extraction failures for packages with large native binaries (onnxruntime, sharp).

**Recommended: install from tarball instead**
```bash
git clone https://github.com/wmt-mobile/localnest.git
cd localnest
npm pack
npm install -g ./localnest-mcp-*.tgz
```

**Alternative: use --ignore-scripts then rebuild**
```bash
npm install -g --ignore-scripts git+https://github.com/wmt-mobile/localnest.git#release/0.3.0
cd $(npm root -g)/localnest-mcp && npm install
```

### Enabling Semantic Search

`@huggingface/transformers` (used for local embeddings) is installed automatically by the postinstall script. If it wasn't installed (check with `localnest doctor`), install manually:
```bash
cd $(npm root -g)/localnest-mcp && npm install --no-save @huggingface/transformers
```

### Common Issues

| Issue | Fix |
|-------|-----|
| `TAR_ENTRY_ERROR ENOENT` during install | Use `npm pack` + `npm install -g ./file.tgz` instead of `git+https://` |
| `spawn sh ENOENT` | Same as above — npm concurrent extraction bug |
| `tarball data (null) seems corrupted` | Clear cache: `npm cache clean --force` then retry |
| Semantic search not working | Run `cd $(npm root -g)/localnest-mcp && npm install --no-save @huggingface/transformers` |
| `localnest: command not found` | Verify: `npm root -g` is in your PATH |
| `tsx not found` | Run `cd $(npm root -g)/localnest-mcp && npm install` |

---

## 🤝 Contributing & Documentation

- 📖 **[Documentation](https://wmt-mobile.github.io/localnest/)**
- 🏗️ **[Architecture](./localnest-docs/docs/guides/architecture.md)**
- 📜 **[Changelog](./CHANGELOG.md)**
- 🛡️ **[Security Policy](./SECURITY.md)**

---

<p align="center">
  Built with ❤️ by the LocalNest Team.<br>
  <b>Empower your AI. Own your Context.</b>
</p>
