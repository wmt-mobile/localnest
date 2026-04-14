<h1 align="center">LocalNest MCP</h1>

<p align="center">
  <strong>The ultimate Local-First AI Context Engine & Persistent Memory</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/localnest-mcp"><img src="https://img.shields.io/npm/v/localnest-mcp.svg?style=for-the-badge&color=success" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/localnest-mcp/v/beta"><img src="https://img.shields.io/npm/v/localnest-mcp/beta?style=for-the-badge&label=beta&color=blue" alt="beta track"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-gold.svg?style=for-the-badge" alt="License: MIT"></a>
  <a href="https://github.com/wmt-mobile/localnest/actions/workflows/quality.yml"><img src="https://img.shields.io/github/actions/workflow/status/wmt-mobile/localnest/quality.yml?branch=main&style=for-the-badge&label=Quality" alt="Quality"></a>
</p>

<br />

**LocalNest** is the world’s first local-first Model Context Protocol (MCP) server that seamlessly integrates **Semantic Code Search**, **Persistent AI Memory**, and a **Temporal Knowledge Graph**. It enables your AI agents to build a "nest" of knowledge directly on your machine—ensuring complete privacy, lightning-fast speed, and cross-session intelligence without relying on cloud embeddings.

---

## ✨ Why LocalNest?

Modern AI agents suffer from amnesia. They forget your architectural decisions, bug fixes, and preferences the moment you close the session.

LocalNest solves this by giving your agents **74 specialized tools** to read, write, and traverse a permanent local knowledge base—backed by high-performance SQLite-vec and HuggingFace local embeddings.

| 🧠 **Persistent Intelligence** | ⚡ **Instant Recall** | 🔒 **100% Private** |
|:---|:---|:---|
| Agents remember decisions and workflows across every session. | Fused lexical + semantic search powered by `sqlite-vec`. | Zero cloud dependencies. Your code and embeddings stay local. |

---

## 🚀 Quick Start

Get up and running in seconds. Choose your preferred release track:

### 1. Installation

**Stable Track** *(Recommended for production workflows)*
```bash
npm install -g localnest-mcp
```

**Beta Track** *(Access the new Interactive TUI Dashboard)*
```bash
npm install -g localnest-mcp@beta
```

### 2. Enable Local Embeddings (One-Time Setup)
```bash
cd $(npm root -g)/localnest-mcp && npm install --no-save @huggingface/transformers
```

### 3. Initialize Workspace
```bash
localnest setup
# (Beta only) Open the interactive memory viewer:
localnest dashboard
```

> **Note:** If you are installing directly from GitHub and encounter errors, please see the [Troubleshooting](#-troubleshooting) section for workarounds related to npm native binary extraction.

---

## 🛠️ Tool Suites

LocalNest exposes **74 specialized MCP tools** to your AI, meticulously categorized for agentic efficiency. For the complete parameter reference, explore the [Full Tool Documentation](https://wmt-mobile.github.io/localnest/docs/tools/overview).

<details>
<summary><b>📂 Workspace & Discovery</b></summary>
<p>Tools for navigating file structures, scoping read operations, and generating high-level project summaries.</p>
</details>

<details>
<summary><b>🧠 Semantic Search & Core Intelligence</b></summary>
<p>Fused lexical/semantic search with RRF ranking, plus deep AST-aware queries for callers, definitions, implementations, and rename previews.</p>
</details>

<details>
<summary><b>🕸️ Graph & Temporal Memory</b></summary>
<p>Cross-session task context, recall capabilities, and entity management over a multi-hop subject-predicate-object knowledge graph.</p>
</details>

---

## 🤖 Agentic Integrations

LocalNest is designed to be the foundational context layer for AI coding assistants (like Claude Code, Cursor, and custom MCP clients).

- 🏁 **Cold Start:** Agents trigger `agent_prime` to instantly hydrate their context window with relevant memories and recent changes.
- 🔍 **Deep Investigation:** Agents use `find` to run fused searches across codebase fragments and historical design decisions.
- 🎓 **Continuous Learning:** Agents call `teach` to proactively save new architectural rules, ensuring they never repeat the same mistake twice.

---

## ⚖️ How We Compare

| Feature | **LocalNest** | Leading Memory MCPs | Standard Code Search |
|:---|:---:|:---:|:---:|
| **Local-First Embeddings** | ✅ | ❌ | ❌ |
| **AST-Aware Intelligence** | ✅ | ❌ | ✅ |
| **Knowledge Graph** | ✅ | ❌ | ❌ |
| **Interactive Terminal UI** | ✅ | ❌ | ❌ |

---

## 🛡️ Enterprise-Grade Quality

We treat LocalNest with the same rigorous standard as production infrastructure. Our fully automated OSS security pipeline includes:

- 🛂 **OIDC Trusted Publishing** for verifiable `npm` provenance.
- 🔬 **Continuous CodeQL** static analysis on all branches.
- 📦 **OpenSSF Scorecard** monitoring and proactive Dependabot updates.

---

## 🆘 Troubleshooting

<details>
<summary><b>Installing from GitHub (git+https://) Fails</b></summary>

<br/>
Direct `npm install -g git+https://...` may fail with `TAR_ENTRY_ERRORS` or `spawn sh ENOENT`. This is a <a href="https://github.com/npm/cli/issues/3910">known npm limitation</a> where git dependencies auto-bundle `node_modules` into the tarball.

**Fix 1: Install from tarball**
```bash
git clone https://github.com/wmt-mobile/localnest.git
cd localnest
npm pack
npm install -g ./localnest-mcp-*.tgz
```

**Fix 2: Bypass Scripts**
```bash
npm install -g --ignore-scripts git+https://github.com/wmt-mobile/localnest.git#release/0.3.0
cd $(npm root -g)/localnest-mcp && npm install
```
</details>

<details>
<summary><b>Semantic Search Not Working</b></summary>
<br/>
Ensure the HuggingFace transformers module is installed in the global `localnest-mcp` directory:

```bash
cd $(npm root -g)/localnest-mcp && npm install --no-save @huggingface/transformers
```
</details>

---

## 📚 Resources & Community

- 📖 **[Official Documentation](https://wmt-mobile.github.io/localnest/)** – Deep dives into all 74 tools.
- 🏗️ **[Architecture Guide](./localnest-docs/docs/guides/architecture.md)** – Understand the engine beneath.
- 📜 **[CHANGELOG](./CHANGELOG.md)** – See what's new.
- 🛡️ **[SECURITY](./SECURITY.md)** – Our vulnerability disclosure policy.

---

<div align="center">
  Built with ❤️ by the LocalNest Team. <br />
  <strong>Empower your AI. Own your context.</strong>
</div>
