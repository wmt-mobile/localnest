# LocalNest Memory Enhancement

## What This Is

LocalNest is an MCP server for local code retrieval and persistent agent memory. This milestone closes the memory capability gaps identified by comparing LocalNest against MemPalace — upgrading from basic flat memory entries to a full knowledge graph with temporal triples, conversation ingestion, hierarchical taxonomy, graph traversal, agent-scoped namespaces, and semantic deduplication.

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

- [ ] Knowledge graph with temporal triples (subject→predicate→object, valid_from/valid_to)
- [ ] Conversation/chat ingestion pipeline (Markdown, JSON, Slack exports)
- [ ] Temporal validity on facts (as_of queries, fact invalidation)
- [ ] Hierarchical memory organization (nest/branch taxonomy — LocalNest's own organic metaphor)
- [ ] Graph traversal (multi-hop walks, cross-domain tunnel discovery)
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
*Last updated: 2026-04-08 after initialization*
