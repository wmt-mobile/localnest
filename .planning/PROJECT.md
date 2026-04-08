# LocalNest

## What This Is

LocalNest is a local-first MCP server that gives AI agents safe, scoped access to code — with hybrid search, semantic indexing, temporal knowledge graph, and persistent memory that never leaves your machine. 50 MCP tools, zero cloud dependencies, pure SQLite.

## Current Milestone: v2.0 CLI-First Architecture

**Goal:** Consolidate all commands into a unified noun-verb CLI and polish hooks/MCP for universal AI interoperability.

**Target features:**
- Commander.js CLI framework with `localnest <noun> <verb>` subcommands
- Memory CLI commands (add/search/list/show/delete)
- Knowledge Graph CLI commands (kg add/query/timeline/stats)
- Skill CLI commands (skill install/list/remove/search)
- MCP lifecycle CLI (mcp start/status/config)
- Ingest CLI (ingest markdown/json)
- Hook MCP tools + polish for AI discoverability
- Shell completions + --json flag + colored help formatting
- Deprecate old localnest-mcp-* fragmented binaries

## Core Value

A single local MCP server that handles both code retrieval AND rich structured memory — no cloud dependencies, no external databases, pure SQLite.

## Requirements

### Validated

- Memory entries with CRUD, revision history, importance/confidence scoring — existing
- Embedding-based semantic recall via HuggingFace MiniLM-L6-v2 — existing
- Flat memory relations (source→target, type) — existing
- Event capture with signal scoring and auto-promotion — existing
- Multi-project scoping (project_path, branch_name, root_path) — existing
- SQLite-backed storage via node:sqlite — existing
- Code retrieval with AST chunking, BM25+vector hybrid search — existing
- MCP tool exposure for all memory and retrieval operations — existing

### Active

- [ ] Unified CLI framework with Commander.js noun-verb subcommands
- [ ] Memory CLI commands (localnest memory add/search/list/show/delete)
- [ ] Knowledge Graph CLI commands (localnest kg add/query/timeline/stats)
- [ ] Skill CLI commands (localnest skill install/list/remove/search)
- [ ] MCP lifecycle CLI (localnest mcp start/status/config)
- [ ] Ingest CLI (localnest ingest markdown/json)
- [ ] Hook MCP tools (localnest_hooks_stats, before/after event exposure)
- [ ] Shell completions + --json flag + colored help
- [ ] Deprecate old localnest-mcp-* binaries
- [ ] Agent-scoped memory (per-agent isolated namespaces/diaries)
- [ ] Semantic duplicate detection (similarity-based dedup before storage)

### Out of Scope

- Cloud/hosted deployment — LocalNest is local-first by design
- LLM-based summarization — store verbatim, avoid lossy compression (lesson from MemPalace AAAK regression)
- ChromaDB integration — SQLite+sqlite-vec is lighter and more stable
- Python runtime — Node.js/JavaScript only
- Real-time streaming — batch operations sufficient for MCP

## Context

- LocalNest is a published npm package (v0.0.6-beta.1) with existing users
- All changes must be backwards-compatible with existing memory_entries and memory_relations tables
- Schema is currently at version 5 — new tables/migrations must increment cleanly
- Existing MCP tools (19 registered) must continue working — new tools are additive
- MemPalace achieves 96.6% recall on LongMemEval with raw verbatim mode; their 34% retrieval boost comes from wing+room metadata filtering
- MemPalace's temporal knowledge graph uses SQLite triples — similar to our stack, easy to adapt
- Current embedding service (MiniLM-L6-v2) is sufficient for semantic dedup — no new dependencies needed

## Constraints

- **Tech stack**: Node.js, SQLite via node:sqlite, no new runtime dependencies
- **Backwards compat**: Existing tables/tools must not break — additive migrations only
- **File size**: Keep files under 500 lines per CLAUDE.md rules
- **Dependencies**: Minimize — reuse existing HuggingFace embeddings, no ChromaDB
- **Schema**: Must migrate from v5 cleanly with rollback safety

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| SQLite triples over Neo4j/graph DB | Matches existing stack, zero new deps, MemPalace proves it works | -- Pending |
| Additive schema migrations only | Protect existing users' data | -- Pending |
| Verbatim storage over LLM summaries | MemPalace showed AAAK compression regresses recall 96.6→84.2% | -- Pending |
| Nest/branch as metadata columns, not separate tables | Simpler queries, easier to filter, proven retrieval boost with metadata filtering | -- Pending |
| Nest/branch naming over wing/room | Original LocalNest identity — nests are organic, layered, interconnected — not a copy of MemPalace's palace metaphor | -- Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-08 after milestone v2.0 initialization*
