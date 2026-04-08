# Feature Landscape

**Domain:** AI Agent Memory Systems (MCP Server with Knowledge Graph)
**Researched:** 2026-04-08
**Primary Competitor:** MemPalace (Python/ChromaDB, 20 MCP tools, 96.6% LongMemEval R@5 in raw mode)
**Secondary Competitors:** Hindsight (PostgreSQL+pgvector), Zep/Graphiti (Neo4j), Mem0 (multi-backend), Anthropic Knowledge Graph MCP

## Table Stakes

Features users expect from any serious AI memory system in 2026. Missing any of these and agents will pick a competing MCP server instead.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Verbatim storage (no lossy compression)** | MemPalace proved AAAK compression regresses recall 96.6% to 84.2%. Every serious system now stores raw text. LocalNest already does this. | Already done | CRITICAL lesson from MemPalace. Never compress stored content. |
| **Semantic search (embedding-based recall)** | Every memory MCP server has vector similarity search. Standard since 2024. LocalNest already has MiniLM-L6-v2 embeddings. | Already done | Existing `localnest_memory_recall` with hybrid BM25+vector. |
| **CRUD with revision history** | Users expect to store, update, delete, and see change history. LocalNest already has this via `memory_revisions` table. | Already done | Existing tools: store, get, update, delete. |
| **Flat relations between memories** | Basic "A relates to B" linking. LocalNest already has `memory_relations` table with `localnest_memory_add_relation`. | Already done | Current: source_id, target_id, relation_type. One-hop traversal. |
| **Project/scope filtering** | Multi-project isolation at query time. LocalNest already scopes by project_path, branch_name, root_path. | Already done | Existing scope fields on memory_entries. |
| **Knowledge graph with typed triples** | Subject-predicate-object triples. MemPalace has this. Graphiti has this. Anthropic's own KG MCP server has entities+relations. This is the minimum bar for "knowledge graph" claims. | Medium | New table: `knowledge_triples(subject, predicate, object)`. Distinct from flat `memory_relations` which link memory entries, not arbitrary entities. |
| **Temporal validity on facts** | Every production knowledge graph system (Zep, Graphiti, MemPalace) tracks `valid_from`/`valid_to` on triples. Without this, stale facts poison context. | Medium | Add `valid_from`, `valid_to` columns to triples table. Enable `as_of` queries with `WHERE valid_from <= ? AND (valid_to IS NULL OR valid_to > ?)`. |
| **Semantic duplicate detection** | Hindsight, Mem0, and MemPalace all deduplicate before storage. Without dedup, vector DBs get polluted with redundant entries that waste retrieval slots. | Medium | LocalNest already has `fingerprint` column and merge logic in event-capture. Extend to knowledge triples: before inserting a triple, check embedding similarity against existing triples with same subject. |
| **Event capture with signal scoring** | Automated promotion of significant events into durable memory. LocalNest already has this with `computeSignalScore` and merge-or-promote logic. | Already done | Existing `localnest_memory_capture_event` tool. |

## Differentiators

Features that set LocalNest apart from MemPalace and other competitors. Not universally expected, but high-value.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Multi-hop graph traversal (recursive CTE)** | MemPalace only does flat triple lookup (no multi-hop). Graphiti does BFS but requires Neo4j. LocalNest can do multi-hop traversal in pure SQLite using recursive CTEs -- zero new dependencies, same stack. This is a genuine gap in MemPalace. | Medium | `WITH RECURSIVE walk AS (SELECT ... UNION ALL SELECT ... FROM knowledge_triples JOIN walk ...)` with configurable depth limit (default 3). Expose as `localnest_graph_traverse` tool. |
| **Cross-domain tunnel discovery** | Find unexpected connections between knowledge domains. No competitor does this well. Query: "what connects concept A to concept B?" via bidirectional BFS on the triple graph. | Medium-High | Extension of graph traversal. Run BFS from both endpoints, find intersection. High value for research and architectural reasoning. |
| **Contradiction detection at write time** | MemPalace claims this but doesn't implement it (per independent analysis: "code has none; dedup only blocks identical open triples"). Graphiti does it but requires Neo4j + LLM calls. LocalNest can do lightweight contradiction detection: when inserting a triple with same subject+predicate, check if object conflicts with existing valid triples. No LLM needed -- rule-based. | Medium | Check: same subject + same predicate + different object + overlapping validity window = potential contradiction. Flag it, let the agent decide. |
| **Conversation ingestion pipeline** | MemPalace can mine project artifacts. But structured conversation ingestion (Markdown chat logs, JSON exports, Slack-format) with automatic fact extraction is underserved. Most systems either require LLM-based extraction (expensive) or skip it entirely. LocalNest can do regex+heuristic extraction of speaker turns, decisions, and action items from structured formats without LLM calls. | Medium-High | Parse formats: (1) Markdown with `## Human:` / `## Assistant:` headers, (2) JSON array of `{role, content}` messages, (3) Slack export JSON. Extract: speaker turns, decisions (lines with "decided", "agreed", "will use"), action items ("TODO", "will do", "need to"). Store as memory entries with `source_type: 'conversation'`. |
| **Hierarchical taxonomy (wing/room metadata)** | MemPalace's 34% retrieval boost comes from wing+room metadata filtering. But their implementation uses separate ChromaDB metadata fields. LocalNest can achieve the same boost by adding `wing` and `room` columns to memory_entries as metadata filters on existing queries. Simpler architecture, same benefit. | Low-Medium | Add `wing` (project/domain category) and `room` (sub-topic) columns to memory_entries. Update recall queries to filter by wing/room when provided. This is proven to boost retrieval precision by narrowing the search space before vector similarity runs. |
| **Agent-scoped memory (namespace isolation)** | MemPalace gives each agent its own wing + diary. Mem0 uses `agent_id` scoping. LocalNest can go further with true namespace isolation: each agent gets an `agent_id` scope that isolates its memories. Combined with optional shared namespaces for cross-agent knowledge, this supports multi-agent workflows better than MemPalace's wing-per-agent approach. | Medium | Add `agent_id` column to memory_entries and knowledge_triples. Default to shared namespace (backwards compat). When agent_id is set, queries only return that agent's memories unless `include_shared: true`. Agent diaries are just memories with `kind: 'diary'` and `agent_id` set -- no separate table needed. |
| **As-of temporal queries** | "What was true about X on date Y?" MemPalace has this. Graphiti has this. But neither does it in pure SQLite without external dependencies. LocalNest can expose `localnest_graph_query` with an `as_of` parameter that filters triples by validity window. | Low | Already needed for temporal validity. The `as_of` parameter is just: `WHERE valid_from <= :as_of AND (valid_to IS NULL OR valid_to > :as_of)`. Expose as query parameter on graph tools. |
| **Unified code retrieval + memory** | No competitor combines code AST chunking with BM25+vector hybrid search AND structured memory in a single MCP server. MemPalace is memory-only. LocalNest already has code retrieval. This dual capability is a genuine unique selling point. | Already done | Existing code retrieval tools. Market this advantage. |
| **Decay and importance-based retention** | MemPalace has no decay or forgetting. Memories accumulate forever. LocalNest can implement recency-weighted scoring: boost `recall_count` and `last_recalled_at` on access (already tracked), decay importance for unused memories over time. Prevents context pollution. | Low-Medium | Already tracking `recall_count` and `last_recalled_at`. Add decay factor to recall scoring: `adjusted_score = raw_score * decay_factor(last_recalled_at)`. Optional background cleanup of memories below importance threshold. |

## Anti-Features

Features to explicitly NOT build. Learned from MemPalace's AAAK regression, competitor mistakes, and domain best practices.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **AAAK-style token compression** | MemPalace's AAAK regresses retrieval from 96.6% to 84.2%. Lossy abbreviation changes embeddings, degrades search quality. The 12.4-point drop is catastrophic. MemPalace themselves now recommend raw mode. | Store verbatim always. If context window size is a concern, return fewer results with higher relevance rather than compressing results. |
| **LLM-based fact extraction at write time** | Graphiti and Hindsight use LLMs to extract facts during ingestion. This adds latency (2-5s per write), API costs, and creates a hard dependency on LLM availability. Breaks offline-first promise. | Use rule-based extraction for structured formats (conversation logs). For unstructured text, store verbatim and let the querying agent interpret. Zero-LLM write path is a MemPalace strength worth copying. |
| **Separate graph database (Neo4j, Kuzu)** | Graphiti requires Neo4j. This adds operational complexity, a new dependency, and breaks LocalNest's "pure SQLite" value prop. SQLite recursive CTEs handle graph traversal for the scale of local agent memory. | SQLite knowledge_triples table with recursive CTE traversal. MemPalace proves SQLite is sufficient for temporal KG. Graphiti's Neo4j is overkill for local agent memory. |
| **ChromaDB integration** | MemPalace uses ChromaDB for vectors. LocalNest already has sqlite-vec and MiniLM-L6-v2 embeddings. Adding ChromaDB means a new Python dependency, a new process, and no clear benefit for local-first use. | Continue with sqlite-vec for vector storage. Same embedding model (MiniLM-L6-v2) that MemPalace uses for their 96.6% score. |
| **Palace/spatial metaphor in naming** | MemPalace's wing/room/hall/closet/drawer naming is confusing. Independent analysis noted it obscures what's happening (standard metadata filtering). Technical naming is clearer for developer-facing tools. | Use straightforward naming: `wing` and `room` as column names (borrowed from MemPalace's proven filtering), but expose via tools named `localnest_graph_query`, `localnest_graph_traverse` -- not `palace_navigate`. |
| **LLM-based "reflect" operation** | Hindsight's "reflect" uses an LLM to reason across memories. This is expensive, slow, and couples memory to a specific LLM. The agent calling the MCP server is already an LLM -- it can reason over retrieved facts itself. | Return raw facts from recall/traverse. The calling agent does the reasoning. Memory system should be a fast, dumb retrieval layer, not a reasoning layer. |
| **Full entity resolution with NLP** | Hindsight resolves "Alice" and "my coworker Alice" to the same entity using NLP. This requires an NLP model, adds complexity, and is error-prone. For local agent memory, the agent itself can normalize entity names before storing. | Provide a `subject` normalization helper (lowercase, trim, slug) but don't run entity resolution ML. If agents store consistent subject names, resolution isn't needed. Add documentation showing the pattern. |
| **Write validation gating** | Some systems add quality gates before memory writes. This adds latency and complexity for marginal benefit in a local-first system where the writer is a trusted agent. | Trust the agent. Validate schema/types (Zod schemas already do this), but don't gate on content quality. The event capture pipeline's signal scoring already handles promotion decisions. |

## Feature Dependencies

```
Temporal Validity
  |
  v
Knowledge Graph Triples -----> Contradiction Detection (needs same-subject lookup)
  |                                    |
  v                                    v
Multi-hop Graph Traversal       As-of Temporal Queries (needs valid_from/valid_to)
  |
  v
Cross-domain Tunnel Discovery (needs traversal from both ends)

Hierarchical Taxonomy (wing/room) ----> Agent-scoped Memory (agent_id is an orthogonal scope dimension)
  |                                           |
  v                                           v
Improved Recall Precision              Agent Diary (kind='diary' + agent_id scope)

Semantic Dedup (existing fingerprint + embedding similarity)
  |
  v
Conversation Ingestion (dedup prevents duplicate facts from re-ingestion)

Decay/Retention (standalone, uses existing recall_count + last_recalled_at)
```

### Dependency chain for implementation order:

1. **Knowledge graph triples + temporal validity** -- Foundation. Everything else builds on this.
2. **Semantic dedup for triples** -- Needed before ingestion to prevent pollution.
3. **Hierarchical taxonomy (wing/room)** -- Low complexity, immediate retrieval boost.
4. **Agent-scoped memory** -- Orthogonal, can parallel with taxonomy.
5. **Multi-hop graph traversal** -- Needs triples table to exist.
6. **Contradiction detection** -- Needs triples + temporal validity.
7. **As-of queries** -- Needs temporal fields, simple WHERE clause.
8. **Conversation ingestion** -- Needs dedup + triples to store extracted facts.
9. **Cross-domain tunnels** -- Needs traversal, can come last.
10. **Decay/retention** -- Standalone, implement whenever.

## MVP Recommendation

Prioritize these for the first milestone release:

1. **Knowledge graph triples with temporal validity** (table stakes -- every competitor has this)
2. **Semantic dedup for triples** (prevents data pollution from day one)
3. **Hierarchical taxonomy (wing/room columns)** (proven 34% retrieval boost, low effort)
4. **Multi-hop graph traversal via recursive CTE** (genuine differentiator vs MemPalace's flat lookup)
5. **Agent-scoped memory** (required for multi-agent workflows, growing demand)

Defer to a follow-up milestone:
- **Conversation ingestion**: Medium-High complexity, multiple format parsers. Ship the graph infrastructure first, add ingestion when the storage layer is proven.
- **Cross-domain tunnel discovery**: Cool but niche. Needs traversal to be solid first.
- **Decay/retention**: Important but not blocking. Existing recall_count tracking is sufficient short-term.

## Competitive Position After Implementation

| Capability | LocalNest (planned) | MemPalace | Hindsight | Zep/Graphiti |
|-----------|-------------------|-----------|-----------|-------------|
| Knowledge graph triples | Yes (SQLite) | Yes (SQLite) | Yes (PostgreSQL) | Yes (Neo4j) |
| Temporal validity | Yes | Yes | Limited | Yes (bi-temporal) |
| Multi-hop traversal | Yes (recursive CTE) | No (flat lookup only) | Yes (graph+vector) | Yes (BFS) |
| Contradiction detection | Yes (rule-based) | Claimed, not implemented | Yes (LLM-based) | Yes (LLM-based) |
| Semantic dedup | Yes | File-level only | Yes | Yes |
| Agent-scoped memory | Yes (agent_id column) | Wing-per-agent | N/A | agent_id scoping |
| Code retrieval | Yes (AST+BM25+vector) | No | No | No |
| Offline/local-first | Yes | Yes | No (PostgreSQL) | No (Neo4j) |
| Zero-LLM write path | Yes | Yes | No (LLM extraction) | No (LLM extraction) |
| Dependencies | SQLite only | ChromaDB + SQLite | PostgreSQL + pgvector | Neo4j + LLM API |
| Hierarchical taxonomy | wing/room columns | wing/room/hall/closet | N/A | Custom ontology |

LocalNest's strongest position: the ONLY system combining code retrieval + knowledge graph + temporal memory in a single zero-dependency local MCP server. No competitor offers this combination.

## Sources

- [MemPalace GitHub](https://github.com/milla-jovovich/mempalace) -- PRIMARY COMPETITOR
- [MemPalace independent analysis](https://github.com/lhl/agentic-memory/blob/main/ANALYSIS-mempalace.md) -- CRITICAL: reveals unimplemented claims
- [MemPalace benchmark reproduction (Issue #39)](https://github.com/milla-jovovich/mempalace/issues/39) -- AAAK regression data
- [Zep/Graphiti temporal KG architecture (paper)](https://arxiv.org/abs/2501.13956) -- Temporal validity design reference
- [Graphiti GitHub](https://github.com/getzep/graphiti) -- Multi-hop traversal patterns
- [Hindsight MCP memory server](https://hindsight.vectorize.io/blog/2026/03/04/mcp-agent-memory) -- Entity resolution, 4-strategy retrieval
- [State of AI Agent Memory 2026 (Mem0)](https://mem0.ai/blog/state-of-ai-agent-memory-2026) -- Industry landscape
- [LongMemEval benchmark (ICLR 2025)](https://github.com/xiaowu0162/LongMemEval) -- Evaluation methodology
- [SQLite recursive CTE for graph traversal](https://sqlite.org/forum/info/3b309a9765636b79) -- Implementation reference
- [Best AI Agent Memory Frameworks 2026](https://atlan.com/know/best-ai-agent-memory-frameworks-2026/) -- Framework comparison
- [Hindsight vs Cognee comparison](https://vectorize.io/articles/hindsight-vs-cognee) -- Graph traversal at every tier
