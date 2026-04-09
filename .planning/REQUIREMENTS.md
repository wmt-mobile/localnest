# Requirements: LocalNest

**Defined:** 2026-04-08 (v2.0), updated 2026-04-09 (v0.2.0)
**Core Value:** A single local MCP server that handles both code retrieval AND rich structured memory — no cloud dependencies, no external databases, pure SQLite.

---

## v0.2.0 Requirements — Memory-KG Fusion & Agent-First Surface

### Batch Writes

- [ ] **BATCH-01**: `localnest_kg_add_entities_batch(entities: [])` accepts up to 500 entities in one call and returns `{created, duplicates, errors}` summary only
- [ ] **BATCH-02**: `localnest_kg_add_triples_batch(triples: [])` accepts up to 500 triples in one call and returns `{created, duplicates, errors}` summary only
- [ ] **BATCH-03**: `localnest_memory_store_batch(memories: [])` accepts up to 100 memory entries in one call and returns `{created, duplicates, errors}` summary only
- [ ] **BATCH-04**: Batch operations are transactional — either all succeed or all roll back; partial failures are reported per-item with row index
- [ ] **BATCH-05**: Write-time dedup on `(subject_id, predicate, object_id)` where `valid_to IS NULL` — duplicate triples return existing `id` instead of inserting a new row
- [ ] **BATCH-06**: Every triple auto-stamps `valid_from = NOW()` at write time if not provided, so `kg_as_of` queries return meaningful results

### Terse Responses

- [ ] **TERSE-01**: Every write tool accepts a `response_format: "minimal" | "verbose"` parameter (default `verbose` for single writes, `minimal` for batch writes)
- [ ] **TERSE-02**: `minimal` format returns `{id, ok}` for single writes and `{created, duplicates, errors}` for batch writes
- [ ] **TERSE-03**: Read tools drop empty `nest`, `branch`, `topic`, `feature` fields and duplicate `scope_*` fields from response when they are blank
- [ ] **TERSE-04**: Read tools drop `raw_score` when `score` is also present (single source of truth)
- [ ] **TERSE-05**: Target ≥ 70% token reduction on common write operations measured against a fixed benchmark conversation

### Predicate Cardinality

- [ ] **CARD-01**: Hardcoded `FUNCTIONAL_PREDICATES` set covers known single-valued predicates (`status_is`, `version_is`, `owned_by`, `located_at`, `assigned_to`, `current_state`, `has_type`, `primary_language`, `license_is`, `created_by`, `parent_of`, `rooted_at`)
- [ ] **CARD-02**: `kg_predicate_cardinality` table (additive schema migration) allows users to override default cardinality per predicate
- [ ] **CARD-03**: Contradiction detection in `addTriple` only fires for predicates with `cardinality = 'functional'`; multi-valued predicates skip the check entirely
- [ ] **CARD-04**: Unknown predicates default to multi-valued (permissive) — no false positives for custom relations
- [ ] **CARD-05**: Conversation ingestion predicates (`mentioned_by`, `co_occurs_with`) are NOT in the functional list — verified during planning
- [ ] **CARD-06**: Response shape of `addTriple` remains unchanged — same 12 fields, same names, same order

### Memory ↔ KG Fusion

- [ ] **FUSE-01**: `capture_outcome` and `memory_store` extract entities from content (existing regex/heuristic, extended if needed) and auto-create KG entities
- [ ] **FUSE-02**: Auto-generated triples populate `source_memory_id` linking back to the memory that produced them
- [ ] **FUSE-03**: Memory write response is enriched: `{memory_id, auto_linked_entities: [...], auto_triples: [...]}`
- [ ] **FUSE-04**: `memory_recall` and `search_hybrid` optionally include 1-hop KG neighbors for top-N results as a `related_facts: [...]` field on each item
- [ ] **FUSE-05**: `nest_tree` returns correct counts against real data — currently returns 0 despite populated memories (bug fix)
- [ ] **FUSE-06**: A retroactive backfill command links existing disconnected memories to existing KG entities where entity names match content

### Unified Context Primitive

- [ ] **PRIME-01**: `localnest_agent_prime(task_description)` returns `{memories, entities, files, recent_changes, suggested_actions}` under 2KB total
- [ ] **PRIME-02**: `memories` contains top 5 semantically relevant entries
- [ ] **PRIME-03**: `entities` contains top 10 KG entities related to query terms or top memories
- [ ] **PRIME-04**: `files` contains top 5 files based on recent edits + semantic similarity to task
- [ ] **PRIME-05**: `recent_changes` contains a git diff summary since last memory capture in this project
- [ ] **PRIME-06**: `suggested_actions` contains 2-4 "start with X" / "check Y" hints derived from memory + file signals

### Unified Search

- [ ] **FIND-01**: `localnest_find(query)` searches memory entries, code chunks, and KG triples in a single call
- [ ] **FIND-02**: Results are re-ranked across all three sources using normalized scores
- [ ] **FIND-03**: Each result includes a `source: "memory" | "code" | "triple"` field
- [ ] **FIND-04**: Returns top 10 across all sources by default, configurable via `limit`

### Symbol-Aware Code Intelligence

- [ ] **SYM-01**: `localnest_find_callers(symbol)` returns every call site of a function or method across indexed files
- [ ] **SYM-02**: `localnest_find_definition(symbol)` returns the declaration location(s) of a symbol
- [ ] **SYM-03**: `localnest_find_implementations(interface)` returns every implementor of an interface or protocol
- [ ] **SYM-04**: `localnest_rename_preview(old, new)` returns every location that would change if the symbol were renamed
- [ ] **SYM-05**: Tree-sitter AST parsing supports at minimum TypeScript, JavaScript, Python, Go, and Rust
- [ ] **SYM-06**: Symbol queries complete in under 500ms on a 1000-file repo

### Temporal Awareness

- [ ] **TEMPO-01**: `localnest_whats_new(since)` accepts an ISO timestamp or "last_session" and returns files changed, new memories, new triples, and recent commits since that time
- [ ] **TEMPO-02**: Response includes a natural-language delta summary (≤ 200 chars) describing what changed
- [ ] **TEMPO-03**: "last_session" resolves to the most recent `memory_entries.created_at` for the current agent + project scope
- [ ] **TEMPO-04**: `kg_as_of(date)` returns meaningful results because every triple has auto-stamped `valid_from` (see BATCH-06)

### Agent Surface Slim-Down

- [ ] **SLIM-01**: SKILL.md shrinks from ~400 lines to ~50 lines: one paragraph of philosophy + pointer to `localnest_help(task)`
- [ ] **SLIM-02**: `localnest_help(task)` returns just-in-time tool guidance scoped to the current task type
- [ ] **SLIM-03**: `memory_store` auto-infers `project_path` from cwd when not provided
- [ ] **SLIM-04**: `memory_store` auto-infers `branch_name` from git state when not provided
- [ ] **SLIM-05**: `memory_store` auto-infers `nest`, `branch`, `topic`, `tags` from content via simple rule-based classifier when not provided
- [ ] **SLIM-06**: Agent-facing `memory_store` surface is `{title, content}` — every other field is optional with sensible defaults
- [ ] **SLIM-07**: Auto-inferred values populate existing `nest`/`branch` columns so `nest_tree` and `graph_bridges` start working against real data

### Cross-Project Bridges

- [ ] **BRIDGE-01**: `graph_bridges` returns non-zero results when memories span multiple nests (depends on SLIM-07)
- [ ] **BRIDGE-02**: An opt-in scan command backfills memory entries for projects under the root that currently have zero memories
- [ ] **BRIDGE-03**: Cross-project insight surfaces (e.g., "projects A and B share library X") are accessible via a new tool or via enriched `graph_bridges` output

### Proactive Hooks

- [ ] **HOOK-07**: A Read-file hook returns related memory IDs when the file is referenced by high-importance memories (importance ≥ 70)
- [ ] **HOOK-08**: An Edit-file hook flags high-importance memories linked to the edited file and suggests updating them
- [ ] **HOOK-09**: Hook responses are non-blocking — agents can ignore them without breaking the edit flow

### Behavior Modification

- [ ] **TEACH-01**: `localnest_teach(instruction)` writes a high-importance feedback memory tagged for automatic retrieval on future related tasks
- [ ] **TEACH-02**: Teach-type memories surface in `localnest_agent_prime` top-5 recall when the current task semantically matches the instruction domain
- [ ] **TEACH-03**: Teach memories can be listed, updated, and deleted via existing memory CRUD — no new verbs needed beyond the initial `teach`

### Self-Audit

- [ ] **AUDIT-01**: `localnest_audit()` reports memory coverage by project (with/without memories, count per project)
- [ ] **AUDIT-02**: `localnest_audit()` reports KG density metrics: total entities, total triples, connected component count, orphaned entities, duplicate triples
- [ ] **AUDIT-03**: `localnest_audit()` reports unpopulated nests (memories with empty nest/branch) and broken bridges
- [ ] **AUDIT-04**: `localnest_audit()` reports stale memories (never recalled, low importance, older than 30 days)

## v0.2.0 Out of Scope

| Feature | Reason |
|---------|--------|
| Multi-user / team sync | LocalNest stays single-user local-first for v0.2.0 |
| Cloud backup or export to external graph DBs | Violates local-first principle |
| GUI / web dashboard | CLI + MCP are sufficient for agents |
| Custom embedding models beyond MiniLM | Scope creep; MiniLM is proven and cached |
| LLM-based entity extraction | Stays regex/heuristic; no LLM runtime dependency |
| Real-time conversation streaming | Batch ingestion remains sufficient |

---

## v2.0 Requirements (Shipped)

### CLI Framework

- [x] **CLI-01**: Single `localnest` binary with noun-verb subcommands (hand-rolled, zero new deps)
- [x] **CLI-02**: Global flags work on all commands: --json, --verbose, --quiet, --config
- [x] **CLI-03**: Colored help text with command categories (Core, Memory, KG, Skills, Diagnostics)
- [x] **CLI-04**: Version display via `localnest --version` and `localnest version`

### Memory CLI

- [x] **MCLI-01**: `localnest memory add` stores a memory with --type, --importance, --nest, --branch flags
- [x] **MCLI-02**: `localnest memory search` recalls memories by query with --limit, --nest, --branch filters
- [x] **MCLI-03**: `localnest memory list` shows stored memories with --json, --limit, --kind filters
- [x] **MCLI-04**: `localnest memory show <id>` displays one memory with revision history
- [x] **MCLI-05**: `localnest memory delete <id>` removes a memory with -f/--force for non-interactive

### Knowledge Graph CLI

- [x] **KGCLI-01**: `localnest kg add <subject> <predicate> <object>` creates a triple
- [x] **KGCLI-02**: `localnest kg query <entity>` shows all relationships for an entity
- [x] **KGCLI-03**: `localnest kg timeline <entity>` shows chronological fact evolution
- [x] **KGCLI-04**: `localnest kg stats` shows entity count, triple count, predicate breakdown

### Skill CLI

- [x] **SKILL-01**: `localnest skill install` installs bundled skill to all detected AI clients
- [x] **SKILL-02**: `localnest skill list` shows installed skills and their locations
- [x] **SKILL-03**: `localnest skill remove <name>` uninstalls a skill

### MCP Lifecycle CLI

- [x] **MCP-01**: `localnest mcp start` starts the MCP server (stdio mode)
- [x] **MCP-02**: `localnest mcp status` shows server health and config
- [x] **MCP-03**: `localnest mcp config` outputs ready-to-paste MCP config JSON for AI clients

### Ingest CLI

- [x] **ING-01**: `localnest ingest <file>` ingests a conversation file with auto-format detection
- [x] **ING-02**: `localnest ingest <file> --format markdown|json` explicit format override
- [x] **ING-03**: `localnest ingest <file> --nest <name> --branch <name>` assigns taxonomy

### Hook MCP Tools

- [x] **HOOK-01**: `localnest_hooks_stats` MCP tool returns registered hook counts and event types
- [x] **HOOK-02**: `localnest_hooks_list_events` MCP tool returns all valid hook event names
- [x] **HOOK-03**: Hook system is documented in skill with usage examples

### Shell Completions

- [x] **COMP-01**: `localnest completion bash` outputs bash completion script
- [x] **COMP-02**: `localnest completion zsh` outputs zsh completion script
- [x] **COMP-03**: `localnest completion fish` outputs fish completion script

### Binary Deprecation

- [x] **DEP-01**: Old `localnest-mcp-setup` redirects to `localnest setup` with deprecation warning
- [x] **DEP-02**: Old `localnest-mcp-doctor` redirects to `localnest doctor` with deprecation warning
- [x] **DEP-03**: Old `localnest-mcp-upgrade` redirects to `localnest upgrade` with deprecation warning
- [x] **DEP-04**: Old `localnest-mcp-install-skill` redirects to `localnest skill install` with deprecation warning

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| v2.0 requirements (CLI-01 through DEP-04, 32 total) | Phases 10-18 | Complete |
| v0.2.0 requirements (BATCH, TERSE, CARD, FUSE, PRIME, FIND, SYM, TEMPO, SLIM, BRIDGE, HOOK-07-09, TEACH, AUDIT) | Phases 26-38 (TBD by roadmapper) | Pending |

**Coverage:**
- v2.0: 32/32 mapped, shipped
- v0.2.0: ~60 requirements, phase mapping pending roadmapper

---
*Requirements defined: 2026-04-08 (v2.0), updated 2026-04-09 (v0.2.0)*
