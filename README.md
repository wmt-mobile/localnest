<!-- cspell:ignore localnest LOCALNEST winget MSVC choco HuggingFace huggingface reranker RERANKER Kiro duplicative refreshable SARIF reranking ripgrep -->

# LocalNest MCP

[![stable](https://img.shields.io/npm/v/localnest-mcp?label=stable)](https://www.npmjs.com/package/localnest-mcp)
[![nightly](https://img.shields.io/npm/v/localnest-mcp/beta?label=nightly&color=blueviolet)](https://www.npmjs.com/package/localnest-mcp?activeTab=versions)
[![Node.js](https://img.shields.io/node/v/localnest-mcp)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Quality](https://github.com/wmt-mobile/localnest/actions/workflows/quality.yml/badge.svg?branch=beta)](https://github.com/wmt-mobile/localnest/actions/workflows/quality.yml)
[![CodeQL](https://github.com/wmt-mobile/localnest/actions/workflows/codeql.yml/badge.svg?branch=beta)](https://github.com/wmt-mobile/localnest/actions/workflows/codeql.yml)
[![Socket](https://badge.socket.dev/npm/package/localnest-mcp)](https://socket.dev/npm/package/localnest-mcp)

**Your codebase. Your AI. Your machine — no cloud, no leaks, no surprises.**

LocalNest is a local-first MCP server that gives AI agents safe, scoped access to your code — with hybrid search, semantic indexing, and persistent memory that never leaves your machine.

📖 [Full documentation](https://wmt-mobile.github.io/localnest/) · [Architecture deep dive](./guides/architecture.md)

## README Languages

English · [العربية الفصحى](./readme/README.ar-001.md) · [বাংলা (বাংলাদেশ)](./readme/README.bn-BD.md) · [Deutsch (Deutschland)](./readme/README.de-DE.md) · [Español (Latinoamérica)](./readme/README.es-419.md) · [Français (France)](./readme/README.fr-FR.md) · [हिन्दी (भारत)](./readme/README.hi-IN.md) · [Bahasa Indonesia](./readme/README.id-ID.md) · [日本語](./readme/README.ja-JP.md) · [한국어](./readme/README.ko-KR.md) · [Português (Brasil)](./readme/README.pt-BR.md) · [Русский](./readme/README.ru-RU.md) · [Türkçe](./readme/README.tr-TR.md) · [简体中文](./readme/README.zh-CN.md)

These translated files are locale-specific full README translations. See [translation policy](./readme/TRANSLATION_POLICY.md) for the target locale matrix and terminology rules. The English [README.md](./README.md) remains the source of truth for the newest commands, release notes, and full details.

---

## Why LocalNest?

Most AI code tools phone home. LocalNest doesn't.

Everything — file reads, vector embeddings, memory — runs in-process on your machine. No cloud subscription, no rate limits, no data leaving your box. And because it speaks MCP, any compatible client (Cursor, Windsurf, Codex, Kiro, Gemini CLI) can plug in with one config block.

| What you get | How it works |
|---|---|
| **Safe file access** | Scoped reads under your configured roots — nothing outside |
| **Instant lexical search** | ripgrep-backed symbol and pattern search (JS fallback if missing) |
| **Semantic search** | Local vector embeddings via `all-MiniLM-L6-v2` — no GPU needed |
| **Hybrid retrieval** | Lexical + semantic fused with RRF ranking for best-of-both results |
| **Project awareness** | Auto-detects projects from marker files, scopes every tool call |
| **Agent memory** | Durable, queryable knowledge graph — your AI remembers what it learned |
| **Temporal knowledge graph** | Subject-predicate-object triples with time validity — query what was true when |
| **Multi-hop graph traversal** | Walk relationships 2-5 hops deep via recursive CTEs — no other local tool does this |
| **Nest/Branch hierarchy** | Two-level memory taxonomy for organized retrieval with metadata-filtered boost |
| **Conversation ingestion** | Import Markdown/JSON chat exports into structured memory + KG triples |
| **Agent isolation** | Per-agent diary and memory scoping — multiple agents, zero cross-contamination |
| **Hooks system** | Pre/post operation hooks for memory, KG, traversal, ingestion — plug in your own logic |

---

## Quick Start

```bash
npm install -g localnest-mcp
localnest setup
localnest doctor
```

**3. Drop this into your MCP client config**

Setup auto-writes the config for detected tools. You'll also find a ready-to-paste block at `~/.localnest/config/mcp.localnest.json`:

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
        "LOCALNEST_DB_PATH": "~/.localnest/data/localnest.db",
        "LOCALNEST_INDEX_PATH": "~/.localnest/data/localnest.index.json",
        "LOCALNEST_EMBED_PROVIDER": "huggingface",
        "LOCALNEST_EMBED_MODEL": "sentence-transformers/all-MiniLM-L6-v2",
        "LOCALNEST_EMBED_CACHE_DIR": "~/.localnest/cache",
        "LOCALNEST_EMBED_DIMS": "384",
        "LOCALNEST_RERANKER_PROVIDER": "huggingface",
        "LOCALNEST_RERANKER_MODEL": "cross-encoder/ms-marco-MiniLM-L-6-v2",
        "LOCALNEST_RERANKER_CACHE_DIR": "~/.localnest/cache",
        "LOCALNEST_MEMORY_ENABLED": "false",
        "LOCALNEST_MEMORY_BACKEND": "auto",
        "LOCALNEST_MEMORY_DB_PATH": "~/.localnest/data/localnest.memory.db"
      }
    }
  }
}
```

> **Windows:** Use the config written by `localnest setup` — it sets the correct command for your platform automatically.

Restart your MCP client. If it times out, set `startup_timeout_sec: 30` in your client config.

**Requirements:** Node.js `>=18` · ripgrep recommended but optional

AST-aware chunking ships by default for `JavaScript`, `Python`, `Go`, `Bash`, `Lua`, and `Dart`. Other languages still index cleanly with line-based fallback chunking.

The current stable runtime uses `@huggingface/transformers` for local embeddings and reranking. New setup defaults use `huggingface`, and older `xenova` configs remain accepted as a compatibility alias.

```bash
# macOS
brew install ripgrep

# Ubuntu/Debian
sudo apt-get install ripgrep

# Windows
winget install BurntSushi.ripgrep.MSVC
```

---

## Upgrade

```bash
localnest upgrade              # latest stable
localnest upgrade stable       # latest stable
localnest upgrade beta         # latest beta
localnest upgrade <version>    # pin to a specific version
localnest version              # check current
```

---

## How Agents Use It

Two workflows cover almost everything:

### Fast lookup — find it, read it, done
Best for pinpointing a file, symbol, or code pattern.

```
localnest_search_files   → find the module by path/name
localnest_search_code    → find the exact symbol or identifier
localnest_read_file      → read the relevant lines
```

### Deep task — debug, refactor, review with context
Best for complex work where memory and semantic understanding matter.

```
localnest_task_context    → one call: runtime status + recalled memories
localnest_search_hybrid   → concept-level search across your codebase
localnest_read_file       → read the relevant sections
localnest_capture_outcome → persist what you learned for next time
```

> **Tool success ≠ useful result.** A tool can return OK and still be empty. Treat non-empty file matches and real line content as meaningful evidence — not just process success.

---

## Tools

### Workspace & Discovery

| Tool | What it does |
|------|-------------|
| `localnest_list_roots` | List configured roots |
| `localnest_list_projects` | List projects under a root |
| `localnest_project_tree` | File/folder tree for a project |
| `localnest_summarize_project` | Language and extension breakdown |
| `localnest_read_file` | Read a bounded line window from a file |

### Search & Index

| Tool | What it does |
|------|-------------|
| `localnest_search_files` | File/path name search — start here for module discovery |
| `localnest_search_code` | Lexical search — exact symbols, regex, identifiers |
| `localnest_search_hybrid` | Hybrid search — lexical + semantic, RRF-ranked |
| `localnest_get_symbol` | Find definition/export locations for a symbol |
| `localnest_find_usages` | Find import and call-site usages for a symbol |
| `localnest_index_project` | Build or refresh the semantic index |
| `localnest_index_status` | Index metadata — exists, stale, backend |
| `localnest_embed_status` | Embedding backend and vector-search readiness |

### Memory

| Tool | What it does |
|------|-------------|
| `localnest_task_context` | One-call runtime + memory context for a task |
| `localnest_memory_recall` | Recall relevant memories for a query |
| `localnest_capture_outcome` | Capture a task outcome into memory |
| `localnest_memory_capture_event` | Background event ingest with auto-promotion |
| `localnest_memory_store` | Store a memory manually |
| `localnest_memory_update` | Update a memory and append a revision |
| `localnest_memory_delete` | Delete a memory |
| `localnest_memory_get` | Fetch one memory with revision history |
| `localnest_memory_list` | List stored memories |
| `localnest_memory_events` | Inspect recent memory events |
| `localnest_memory_add_relation` | Link two memories with a named relation |
| `localnest_memory_remove_relation` | Remove a relation |
| `localnest_memory_related` | Traverse the knowledge graph one hop |
| `localnest_memory_suggest_relations` | Auto-suggest related memories by similarity |
| `localnest_memory_status` | Memory consent, backend, and database status |

### Knowledge Graph

| Tool | What it does |
|------|-------------|
| `localnest_kg_add_entity` | Create entities (people, projects, concepts, tools) |
| `localnest_kg_add_triple` | Add subject-predicate-object facts with temporal validity |
| `localnest_kg_query` | Query entity relationships with direction filtering |
| `localnest_kg_invalidate` | Mark a fact as no longer valid (archival, not deletion) |
| `localnest_kg_as_of` | Point-in-time queries — what was true on date X? |
| `localnest_kg_timeline` | Chronological fact evolution for an entity |
| `localnest_kg_stats` | Entity count, triple count, predicate breakdown |

### Nest/Branch Organization

| Tool | What it does |
|------|-------------|
| `localnest_nest_list` | List all nests (top-level memory domains) with counts |
| `localnest_nest_branches` | List branches (topics) within a nest |
| `localnest_nest_tree` | Full hierarchy: nests, branches, and counts |

### Graph Traversal

| Tool | What it does |
|------|-------------|
| `localnest_graph_traverse` | Multi-hop traversal with path tracking (recursive CTEs) |
| `localnest_graph_bridges` | Find cross-nest bridges — connections across domains |

### Agent Diary

| Tool | What it does |
|------|-------------|
| `localnest_diary_write` | Write a private scratchpad entry (agent-isolated) |
| `localnest_diary_read` | Read your own recent diary entries |

### Conversation Ingestion

| Tool | What it does |
|------|-------------|
| `localnest_ingest_markdown` | Import Markdown conversation exports into memory + KG |
| `localnest_ingest_json` | Import JSON conversation exports into memory + KG |
| `localnest_memory_check_duplicate` | Semantic duplicate detection before filing |

### Server & Updates

| Tool | What it does |
|------|-------------|
| `localnest_server_status` | Runtime config, roots, ripgrep, index backend |
| `localnest_health` | Compact health summary with background monitor report |
| `localnest_usage_guide` | Best-practice guidance for agents |
| `localnest_update_status` | Check npm for latest version (cached) |
| `localnest_update_self` | Update globally and sync bundled skill (approval required) |

**50 tools total.** All support `response_format: "json"` (default) or `"markdown"`. List tools return `total_count`, `has_more`, `next_offset` for pagination.

---

## How LocalNest Compares

LocalNest is the only local-first MCP server that combines code retrieval AND structured memory in a single tool. Here's where it stands:

| Capability | LocalNest | MemPalace | Zep | Graphiti | Mem0 |
|---|---|---|---|---|---|
| **Local-first (no cloud)** | Yes | Yes | No ($25+/mo) | No (Neo4j) | No ($20-200/mo) |
| **Code retrieval** | 50 MCP tools, AST-aware, hybrid search | None | None | None | None |
| **Knowledge graph** | SQLite triples with temporal validity | SQLite triples | Neo4j | Neo4j | Key-value |
| **Multi-hop traversal** | Yes (recursive CTEs, 2-5 hops) | No (flat lookup only) | No | Yes (requires Neo4j) | No |
| **Temporal queries (as_of)** | Yes | Yes | Yes | Yes | No |
| **Contradiction detection** | Yes (write-time warnings) | Exists but not wired in | No | No | No |
| **Conversation ingestion** | Markdown + JSON | Markdown + JSON + Slack | No | No | No |
| **Agent isolation** | Per-agent scoping + private diary | Wing-per-agent | User/session scoping | No | User/agent/run/session |
| **Semantic dedup** | 0.92 cosine gate on all writes | 0.9 threshold | No | No | No |
| **Memory hierarchy** | Nest/Branch (original) | Wing/Room/Hall (palace) | Flat | Flat | Flat |
| **Hooks system** | Pre/post operation hooks | None | Webhooks | None | None |
| **Runtime** | Node.js (lightweight) | Python + ChromaDB | Python + Neo4j | Python + Neo4j | Python (cloud) |
| **Dependencies** | 0 new (pure SQLite) | ChromaDB (heavy) | Neo4j ($25+/mo) | Neo4j | Cloud API |
| **MCP tools** | 50 | 19 | 0 | 0 | 0 |
| **Cost** | Free | Free | $25+/mo | $25+/mo | $20-200/mo |

**LocalNest's unique position:** The only tool that gives your AI both deep code understanding AND structured persistent memory — entirely local, zero cloud, zero cost.

---

## Memory — Your AI Doesn't Forget

Enable memory during `localnest setup` and LocalNest starts building a durable knowledge graph in a local SQLite database. Every bug fix, architectural decision, and preference your AI agent touches can be recalled on the next session.

- Requires **Node 22.13+** — search and file tools work fine on Node 18/20 without it
- Memory failure never blocks other tools — everything degrades independently

**How auto-promotion works:** events captured via `localnest_memory_capture_event` are scored for signal strength. High-signal events — bug fixes, decisions, preferences — get promoted into durable memories. Weak exploratory events are recorded and quietly discarded after 30 days.

**Knowledge graph:** Store structured facts as subject-predicate-object triples with temporal validity. Query what was true at any point in time with `as_of`. Walk relationships 2-5 hops deep with recursive CTE traversal. Detect contradictions at write time.

**Nest/Branch hierarchy:** Organize memories into nests (top-level domains) and branches (topics). Metadata-filtered recall narrows candidates before scoring for faster, more precise results.

**Agent isolation:** Each agent gets its own memory scope and private diary. Recall returns own + global memories, never another agent's private data.

**Semantic dedup:** Every write passes through an embedding similarity gate (default 0.92 cosine threshold). Near-duplicates are caught before storage — your memory stays clean.

**Conversation ingestion:** Import Markdown or JSON chat exports. Each turn becomes a memory entry with automatic entity extraction and KG triple creation. Re-ingestion of the same file is skipped by content hash.

**Hooks:** Register pre/post callbacks on any memory operation — store, recall, KG writes, traversal, ingestion. Build custom pipelines without modifying core code.

---

## Index Backend

| Backend | When to use |
|---------|-------------|
| `sqlite-vec` | **Recommended.** Persistent SQLite, fast and efficient for large repos. Requires Node 22+. |
| `json` | Compatibility fallback. Auto-selected if sqlite-vec is unavailable. |

Check `localnest_server_status` → `upgrade_recommended` to know when to migrate.

---

## Configuration

Setup writes everything to `~/.localnest/`:

```
~/.localnest/
├── config/   → localnest.config.json, mcp.localnest.json
├── data/     → SQLite index + memory databases
├── cache/    → Model weights, update status
├── backups/  → Config migration history
└── vendor/   → Managed native deps (sqlite-vec)
```

**Config priority:** `PROJECT_ROOTS` env → `LOCALNEST_CONFIG` file → current directory

**Key environment variables:**

| Variable | Default | Description |
|----------|---------|-------------|
| `LOCALNEST_INDEX_BACKEND` | `sqlite-vec` | `sqlite-vec` or `json` |
| `LOCALNEST_DB_PATH` | `~/.localnest/data/localnest.db` | SQLite database path |
| `LOCALNEST_VECTOR_CHUNK_LINES` | `60` | Lines per index chunk |
| `LOCALNEST_VECTOR_CHUNK_OVERLAP` | `15` | Overlap between chunks |
| `LOCALNEST_VECTOR_MAX_FILES` | `20000` | Max files per index run |
| `LOCALNEST_EMBED_MODEL` | `sentence-transformers/all-MiniLM-L6-v2` | Embedding model |
| `LOCALNEST_EMBED_CACHE_DIR` | `~/.localnest/cache` | Model cache path |
| `LOCALNEST_RERANKER_MODEL` | `cross-encoder/ms-marco-MiniLM-L-6-v2` | Cross-encoder reranker model |
| `LOCALNEST_MEMORY_ENABLED` | `false` | Enable local memory subsystem |
| `LOCALNEST_MEMORY_DB_PATH` | `~/.localnest/data/localnest.memory.db` | Memory database path |
| `LOCALNEST_MEMORY_AUTO_CAPTURE` | `false` | Auto-promote background events |
| `LOCALNEST_UPDATE_CHECK_INTERVAL_MINUTES` | `120` | npm update check interval |

<details>
<summary>All environment variables</summary>

| Variable | Default | Description |
|----------|---------|-------------|
| `LOCALNEST_INDEX_PATH` | `~/.localnest/data/localnest.index.json` | JSON index path |
| `LOCALNEST_SQLITE_VEC_EXTENSION` | auto-detected | Native `vec0` extension path |
| `LOCALNEST_VECTOR_MAX_TERMS` | `80` | Max terms per chunk |
| `LOCALNEST_EMBED_PROVIDER` | `huggingface` | Embedding backend |
| `LOCALNEST_EMBED_DIMS` | `384` | Embedding vector dimensions |
| `LOCALNEST_RERANKER_PROVIDER` | `huggingface` | Reranker backend |
| `LOCALNEST_RERANKER_CACHE_DIR` | `~/.localnest/cache` | Reranker cache path |
| `LOCALNEST_MEMORY_BACKEND` | `auto` | `auto`, `node-sqlite`, or `sqlite3` |
| `LOCALNEST_MEMORY_CONSENT_DONE` | `false` | Suppress consent prompt |
| `LOCALNEST_UPDATE_PACKAGE` | `localnest-mcp` | npm package name to check |
| `LOCALNEST_UPDATE_FAILURE_BACKOFF_MINUTES` | `15` | Retry on failed npm check |

</details>

## Install Note

`0.0.6-beta.1` keeps `0.0.5` as the current stable line while previewing the CLI deprecation pass: canonical `localnest task-context` / `localnest capture-outcome` commands, deprecated compatibility wrappers for older `localnest-mcp-*` helpers, and no change to the `localnest-mcp` server binary used by MCP clients. Some npm environments may still show a single upstream deprecation warning from the ONNX runtime dependency chain; LocalNest functionality is unaffected.

**Performance tips:**
- Scope queries with `project_path` + a narrow `glob` whenever possible
- Start with `max_results: 20–40`, widen only when needed
- Leave reranking off by default — enable only for final precision passes

---

## Skill Distribution

LocalNest ships bundled AI agent skills from one canonical source and installs tool-specific variants for supported clients. Current user-level targets include generic agents directories plus Codex, Copilot, Claude Code, Cursor, Windsurf, OpenCode, Gemini, Antigravity, Cline, and Continue.

```bash
localnest install skills             # install or update bundled skills
localnest install skills --force     # force reinstall
localnest-mcp-install-skill          # deprecated compatibility alias
```

**Shell CLI tools** for automation and hooks:

```bash
localnest task-context --task "debug auth" --project-path /path/to/project
localnest capture-outcome --task "fix auth" --summary "..." --files-changed 2
```

Legacy aliases `localnest-mcp-task-context` and `localnest-mcp-capture-outcome` still work for compatibility. Both commands accept JSON on stdin. Install from GitHub:

```bash
npx skills add https://github.com/wmt-mobile/localnest --skill localnest-mcp
```

---

## Auto-Migration

Upgrade without ceremony. On startup, LocalNest automatically migrates older config schemas and the flat `~/.localnest` layout into the new `config/`, `data/`, `cache/`, and `backups/` structure. No manual reruns, no broken configs after upgrades.

---

## Security

LocalNest follows the OSS security pipeline pattern:

- **CI quality gate** — [quality.yml](./.github/workflows/quality.yml)
- **CodeQL static analysis** — [codeql.yml](./.github/workflows/codeql.yml)
- **OpenSSF Scorecard** — [scorecards.yml](./.github/workflows/scorecards.yml)
- **Dependabot** — [.github/dependabot.yml](./.github/dependabot.yml)
- **Public scorecard** — https://scorecard.dev/viewer/?uri=github.com/wmt-mobile/localnest

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) · [CHANGELOG.md](./CHANGELOG.md) · [SECURITY.md](./SECURITY.md)

> **New to the codebase?** Start with the **[Architecture Overview](./guides/architecture.md)** — covers how the server boots, how search and memory work, and where everything lives.

---

## Contributors

[![Contributors](https://contrib.rocks/image?repo=wmt-mobile/localnest)](https://github.com/wmt-mobile/localnest/graphs/contributors)

Thanks to everyone who contributes code, docs, reviews, testing, and issue reports.
