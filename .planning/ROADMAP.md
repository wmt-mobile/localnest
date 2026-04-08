# Roadmap: LocalNest Memory Enhancement

## Overview

Transform LocalNest from flat memory entries into a full knowledge graph with temporal triples, hierarchical nest/branch organization, graph traversal, agent-scoped namespaces, semantic deduplication, and conversation ingestion. Nine phases follow the data dependency chain: migration safety first, then knowledge graph core, then layers that consume it (temporal queries, taxonomy, traversal, contradiction detection), then higher-level features (agent scopes, dedup, ingestion), and finally MCP tool registration as the surface layer.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Migration Infrastructure Hardening** - Safe, transactional schema migrations with version validation
- [ ] **Phase 2: Knowledge Graph Core** - Entity and triple storage with schema v6, temporal columns, provenance tracking
- [x] **Phase 3: Temporal Validity** - Point-in-time queries, fact timelines, and KG statistics
- [x] **Phase 4: Nest/Branch Hierarchy** - Two-level memory taxonomy with filtered recall
- [x] **Phase 5: Graph Traversal and Contradiction Detection** - Multi-hop walks, cross-nest bridges, and write-time contradiction warnings
- [x] **Phase 6: Agent-Scoped Memory** - Per-agent namespaces with isolated diary entries
- [x] **Phase 7: Semantic Duplicate Detection** - Embedding similarity gate before storage
- [x] **Phase 8: Conversation Ingestion** - Parse Markdown/JSON conversations into memories and triples
- [ ] **Phase 9: MCP Tool Registration** - Expose all new capabilities as localnest_* MCP tools

## Phase Details

### Phase 1: Migration Infrastructure Hardening
**Goal**: Schema migrations are safe to run against production databases with rollback protection
**Depends on**: Nothing (first phase)
**Requirements**: MIGR-01, MIGR-02
**Success Criteria** (what must be TRUE):
  1. Each schema version bump executes inside its own SQLite transaction -- a failure mid-migration rolls back that version's changes without corrupting the database
  2. The migration runner checks the current schema_version before applying any migration and skips versions already applied
  3. Running migrations on an already-current database is a safe no-op
**Plans:** 1 plan

Plans:
- [x] 01-01-PLAN.md -- Transaction-wrapped migrations and version validation

### Phase 2: Knowledge Graph Core
**Goal**: Users can store and query structured knowledge as entities and triples with provenance
**Depends on**: Phase 1
**Requirements**: KG-01, KG-02, KG-03, KG-04, KG-05, KG-06, KG-07
**Success Criteria** (what must be TRUE):
  1. User can create an entity with a name, type, and properties -- the entity gets a normalized slug ID (lowercase, underscored) and is auto-created on first reference in a triple
  2. User can add a triple (subject-predicate-object) with an optional valid_from date and confidence score, and the triple links back to its originating memory entry via source_memory_id
  3. User can query all relationships for a given entity with optional direction filtering (incoming, outgoing, or both)
  4. User can invalidate a triple by setting its valid_to date, making it no longer appear in current-state queries
  5. Schema v6 tables (kg_entities, kg_triples) and indexes exist after migration
**Plans:** 2 plans

Plans:
- [x] 02-01: Schema v6 migration and kg.js entity/triple CRUD
- [x] 02-02: Entity auto-creation, slug normalization, and store/service wiring

### Phase 3: Temporal Validity
**Goal**: Users can query the knowledge graph at any point in time and view fact evolution
**Depends on**: Phase 2
**Requirements**: TEMP-01, TEMP-02, TEMP-03, TEMP-04
**Success Criteria** (what must be TRUE):
  1. Triples have valid_from and valid_to columns where NULL valid_to means the fact is still valid
  2. User can query triples with an as_of date parameter and receives only facts valid at that point in time
  3. User can view a chronological timeline of all triples for an entity (ordered by valid_from)
  4. User can retrieve KG statistics: total entity count, total triple count, and breakdown by relationship type
**Plans:** 1 plan

Plans:
- [x] 03-01: as_of temporal queries, timeline view, and KG stats

### Phase 4: Nest/Branch Hierarchy
**Goal**: Users can organize memories into a two-level hierarchy (nests and branches) and recall is filtered accordingly
**Depends on**: Phase 2
**Requirements**: NEST-01, NEST-02, NEST-03, NEST-04, NEST-05
**Success Criteria** (what must be TRUE):
  1. Memory entries have nest (top-level domain) and branch (topic within nest) metadata columns added via schema v7
  2. Memory recall filters results by nest and/or branch when those parameters are provided
  3. User can list all nests with their memory counts
  4. User can list branches within a specific nest
  5. User can get the full taxonomy tree (all nests, their branches, and counts at each level)
**Plans:** 2 plans

Plans:
- [x] 04-01: Schema v7 nest/branch columns and recall filter integration
- [x] 04-02: Taxonomy listing and tree query helpers

### Phase 5: Graph Traversal and Contradiction Detection
**Goal**: Users can navigate the knowledge graph across multiple hops and receive warnings when new facts contradict existing ones
**Depends on**: Phase 2, Phase 4
**Requirements**: TRAV-01, TRAV-02, TRAV-03, TRAV-04, CONT-01, CONT-02
**Success Criteria** (what must be TRUE):
  1. User can traverse the knowledge graph from a starting entity with configurable max hops (default 2) and receives discovered entities with path information (hop sequence)
  2. Traversal uses SQLite recursive CTEs with cycle prevention -- no external graph dependencies
  3. User can discover cross-nest bridges: entities that are connected across different nests
  4. When adding a triple, the system detects if another currently-valid triple exists with the same subject and predicate but a different object, and flags the contradiction in the response (not blocked, just warned)
**Plans:** 2 plans

Plans:
- [x] 05-01: graph.js recursive CTE traversal with path tracking
- [x] 05-02: Cross-nest bridge discovery and contradiction detection at write time

### Phase 6: Agent-Scoped Memory
**Goal**: Multiple agents can maintain isolated memory namespaces and private diaries without seeing each other's private data
**Depends on**: Phase 4
**Requirements**: AGNT-01, AGNT-02, AGNT-03, AGNT-04
**Success Criteria** (what must be TRUE):
  1. Memory entries support an agent_id column for per-agent isolation
  2. An agent can write diary entries (private scratchpad) that are not visible to other agents
  3. An agent can read its own recent diary entries with pagination
  4. Memory recall respects agent scope: an agent sees its own memories plus global memories, but not other agents' private entries
**Plans:** 2 plans

Plans:
- [x] 06-01: Agent scopes table, diary CRUD, and recall isolation

### Phase 7: Semantic Duplicate Detection
**Goal**: The system prevents near-duplicate memories from polluting the store by comparing embeddings before storage
**Depends on**: Phase 4
**Requirements**: DEDUP-01, DEDUP-02, DEDUP-03, DEDUP-04
**Success Criteria** (what must be TRUE):
  1. Before storing a new memory, the system checks embedding cosine similarity against recent entries in the same scope (configurable threshold, default 0.92)
  2. User can explicitly check for duplicates before filing, providing content and an optional threshold
  3. When a duplicate is detected, the response includes the matching existing entry (ID, title, similarity score)
  4. The event capture auto-promotion pipeline runs the dedup check before promoting an event to a memory
**Plans:** 2 plans

Plans:
- [x] 07-01: dedup.js embedding similarity gate and integration with entries/event-capture

### Phase 8: Conversation Ingestion
**Goal**: Users can ingest conversation exports into structured memories and knowledge graph triples
**Depends on**: Phase 2, Phase 4, Phase 7
**Requirements**: INGEST-01, INGEST-02, INGEST-03, INGEST-04, INGEST-05
**Success Criteria** (what must be TRUE):
  1. User can ingest a Markdown conversation export and get per-turn memory entries created with proper nest/branch assignment
  2. User can ingest a JSON conversation export (role/content/timestamp arrays) into memory entries
  3. Ingestion extracts entities and creates knowledge graph triples from conversation content using rule-based heuristics (not LLM)
  4. Ingestion runs semantic dedup to prevent storing duplicate conversation turns
  5. Previously ingested files (matched by path + SHA-256 hash) are skipped on re-ingestion
**Plans:** 1 plan

Plans:
- [x] 08-01: Schema v9, parsers, entity extraction, dedup, and store/service wiring

### Phase 9: MCP Tool Registration
**Goal**: All new memory capabilities are accessible to MCP clients through properly registered tools
**Depends on**: Phase 2, Phase 3, Phase 4, Phase 5, Phase 6, Phase 7, Phase 8
**Requirements**: TOOL-01, TOOL-02, TOOL-03, TOOL-04, TOOL-05, TOOL-06
**Success Criteria** (what must be TRUE):
  1. Knowledge graph operations are exposed as localnest_kg_* MCP tools (add entity, add triple, query entity, invalidate triple, as_of query, timeline, stats)
  2. Nest/branch operations are exposed as localnest_nest_* MCP tools (list nests, list branches, get taxonomy tree)
  3. Graph traversal operations are exposed as localnest_graph_* MCP tools (traverse, discover bridges)
  4. Agent diary operations are exposed as localnest_diary_* MCP tools (write entry, read entries)
  5. Conversation ingestion is exposed as localnest_ingest_* MCP tools (ingest markdown, ingest json)
  6. Duplicate check is exposed as localnest_memory_check_duplicate MCP tool
**Plans:** 2 plans

Plans:
- [x] 09-01: graph-tools.js registrar for all 17 MCP tools (KG, nest, graph, diary, ingest, dedup)
- [ ] 09-02: (merged into 09-01 — all tools registered in single file)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 9

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Migration Infrastructure Hardening | 1/1 | Complete | 2026-04-08 |
| 2. Knowledge Graph Core | 2/2 | Complete | 2026-04-08 |
| 3. Temporal Validity | 1/1 | Complete | 2026-04-08 |
| 4. Nest/Branch Hierarchy | 2/2 | Complete | 2026-04-08 |
| 5. Graph Traversal and Contradiction Detection | 2/2 | Complete | 2026-04-08 |
| 6. Agent-Scoped Memory | 1/1 | Complete | 2026-04-08 |
| 7. Semantic Duplicate Detection | 1/1 | Complete | 2026-04-08 |
| 8. Conversation Ingestion | 1/1 | Complete | 2026-04-08 |
| 9. MCP Tool Registration | 1/2 | In Progress | - |
