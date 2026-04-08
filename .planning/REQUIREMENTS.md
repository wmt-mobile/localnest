# Requirements: LocalNest Memory Enhancement

**Defined:** 2026-04-08
**Core Value:** A single local MCP server that handles both code retrieval AND rich structured memory -- no cloud dependencies, no external databases, pure SQLite.

## v1 Requirements

### Migration Infrastructure

- [x] **MIGR-01**: Schema migrations wrap each version bump in its own transaction for safe rollback
- [x] **MIGR-02**: Migration runner validates current schema version before applying new migrations

### Knowledge Graph Core

- [x] **KG-01**: System stores entities with id, name, type, properties, and optional memory_entry link
- [x] **KG-02**: System stores triples (subject-predicate-object) with confidence scores
- [x] **KG-03**: User can add a triple via MCP tool with subject, predicate, object, and optional valid_from date
- [x] **KG-04**: User can query an entity's relationships via MCP tool with optional direction filter
- [x] **KG-05**: User can invalidate a triple by setting valid_to date via MCP tool
- [x] **KG-06**: Triples track provenance via source_memory_id linking back to the originating memory entry
- [x] **KG-07**: Entity IDs are normalized slugs (lowercase, underscored) with auto-creation on first reference

### Temporal Validity

- [x] **TEMP-01**: Triples support valid_from and valid_to date columns (NULL valid_to = still valid)
- [x] **TEMP-02**: User can query triples with as_of date parameter to get point-in-time state
- [x] **TEMP-03**: User can view chronological timeline of all triples for an entity via MCP tool
- [x] **TEMP-04**: KG stats MCP tool reports entity count, triple count, and relationship type breakdown

### Hierarchical Memory Organization (Nest/Branch)

- [x] **NEST-01**: Memory entries support nest (top-level domain) and branch (topic within nest) metadata columns
- [x] **NEST-02**: Memory recall filters results by nest and/or branch when provided
- [x] **NEST-03**: User can list all nests with their memory counts via MCP tool
- [x] **NEST-04**: User can list branches within a nest via MCP tool
- [x] **NEST-05**: User can get full taxonomy tree (nests to branches to counts) via MCP tool

### Graph Traversal

- [x] **TRAV-01**: User can traverse the knowledge graph from a starting entity with configurable max hops (default 2) via MCP tool
- [x] **TRAV-02**: Traversal uses SQLite recursive CTEs for zero-dependency multi-hop walks
- [x] **TRAV-03**: User can discover cross-nest bridges (entities connected across different nests) via MCP tool
- [x] **TRAV-04**: Traversal results include path information (hop sequence from start to each discovered entity)

### Contradiction Detection

- [x] **CONT-01**: System detects contradicting triples at write time (same subject+predicate with different currently-valid objects)
- [x] **CONT-02**: Contradictions are flagged in the response when adding a new triple (not blocked, just warned)

### Agent-Scoped Memory

- [x] **AGNT-01**: Memory entries support an agent_id column for per-agent isolation
- [x] **AGNT-02**: Agent can write diary entries (private scratchpad, not visible to other agents) via MCP tool
- [x] **AGNT-03**: Agent can read its own recent diary entries via MCP tool
- [x] **AGNT-04**: Memory recall respects agent scope -- agent sees own memories + global memories, not other agents' private memories

### Semantic Duplicate Detection

- [x] **DEDUP-01**: System checks embedding similarity before storing new memories (configurable threshold, default 0.92)
- [x] **DEDUP-02**: User can check for duplicates before filing via MCP tool with content and threshold parameters
- [x] **DEDUP-03**: Duplicate detection returns the matching existing entry when a duplicate is found
- [x] **DEDUP-04**: Event capture pipeline runs dedup check before auto-promotion

### Conversation Ingestion

- [x] **INGEST-01**: User can ingest Markdown conversation exports into memory via MCP tool
- [x] **INGEST-02**: User can ingest JSON conversation exports (role/content/timestamp arrays) via MCP tool
- [x] **INGEST-03**: Ingestion splits conversations into per-turn memory entries with proper nest/branch assignment
- [x] **INGEST-04**: Ingestion extracts entities and creates knowledge graph triples from conversation content using rule-based heuristics
- [x] **INGEST-05**: Ingestion runs semantic dedup to prevent storing duplicate conversation turns

### MCP Tool Registration

- [ ] **TOOL-01**: All knowledge graph operations exposed as localnest_kg_* MCP tools
- [ ] **TOOL-02**: All nest/branch operations exposed as localnest_nest_* MCP tools
- [ ] **TOOL-03**: All graph traversal operations exposed as localnest_graph_* MCP tools
- [ ] **TOOL-04**: Agent diary operations exposed as localnest_diary_* MCP tools
- [ ] **TOOL-05**: Conversation ingestion exposed as localnest_ingest_* MCP tools
- [ ] **TOOL-06**: Duplicate check exposed as localnest_memory_check_duplicate MCP tool

## v2 Requirements

Deferred to future milestone.

### Advanced Ingestion

- **INGEST-V2-01**: User can ingest Slack export JSON with user mapping
- **INGEST-V2-02**: User can ingest code documentation files into memory
- **INGEST-V2-03**: Ingestion supports batch processing with progress reporting

### Advanced Graph

- **GRAPH-V2-01**: Combined recall returns both relevant memories AND related graph facts in one query
- **GRAPH-V2-02**: Graph supports weighted traversal (prefer high-confidence paths)
- **GRAPH-V2-03**: Automatic relation suggestions from graph proximity

### Memory Lifecycle

- **LIFE-V2-01**: Memory entries support decay/retention policies
- **LIFE-V2-02**: Stale memories auto-archive based on configurable TTL

## Out of Scope

| Feature | Reason |
|---------|--------|
| LLM-based entity extraction | No LLM runtime available; offline-first constraint |
| LLM-based summarization | MemPalace proved compression regresses recall 96.6% to 84.2% |
| ChromaDB integration | Adds Python dependency; SQLite+sqlite-vec is lighter |
| Neo4j / external graph DB | Contradicts local-first single-file simplicity |
| Real-time conversation streaming | MCP is request/response; batch ingestion sufficient |
| Third taxonomy level (halls) | MemPalace analysis shows halls unused in retrieval ranking |
| Automatic relation creation from triples | Too noisy; let agents decide what to link |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| MIGR-01 | Phase 1 | Complete |
| MIGR-02 | Phase 1 | Complete |
| KG-01 | Phase 2 | Complete |
| KG-02 | Phase 2 | Complete |
| KG-03 | Phase 2 | Complete |
| KG-04 | Phase 2 | Complete |
| KG-05 | Phase 2 | Complete |
| KG-06 | Phase 2 | Complete |
| KG-07 | Phase 2 | Complete |
| TEMP-01 | Phase 3 | Complete |
| TEMP-02 | Phase 3 | Complete |
| TEMP-03 | Phase 3 | Complete |
| TEMP-04 | Phase 3 | Complete |
| NEST-01 | Phase 4 | Complete |
| NEST-02 | Phase 4 | Complete |
| NEST-03 | Phase 4 | Complete |
| NEST-04 | Phase 4 | Complete |
| NEST-05 | Phase 4 | Complete |
| TRAV-01 | Phase 5 | Complete |
| TRAV-02 | Phase 5 | Complete |
| TRAV-03 | Phase 5 | Complete |
| TRAV-04 | Phase 5 | Complete |
| CONT-01 | Phase 5 | Complete |
| CONT-02 | Phase 5 | Complete |
| AGNT-01 | Phase 6 | Complete |
| AGNT-02 | Phase 6 | Complete |
| AGNT-03 | Phase 6 | Complete |
| AGNT-04 | Phase 6 | Complete |
| DEDUP-01 | Phase 7 | Complete |
| DEDUP-02 | Phase 7 | Complete |
| DEDUP-03 | Phase 7 | Complete |
| DEDUP-04 | Phase 7 | Complete |
| INGEST-01 | Phase 8 | Complete |
| INGEST-02 | Phase 8 | Complete |
| INGEST-03 | Phase 8 | Complete |
| INGEST-04 | Phase 8 | Complete |
| INGEST-05 | Phase 8 | Complete |
| TOOL-01 | Phase 9 | Pending |
| TOOL-02 | Phase 9 | Pending |
| TOOL-03 | Phase 9 | Pending |
| TOOL-04 | Phase 9 | Pending |
| TOOL-05 | Phase 9 | Pending |
| TOOL-06 | Phase 9 | Pending |

**Coverage:**
- v1 requirements: 43 total
- Mapped to phases: 43
- Unmapped: 0

---
*Requirements defined: 2026-04-08*
*Last updated: 2026-04-08 after roadmap creation (corrected count from 42 to 43)*
