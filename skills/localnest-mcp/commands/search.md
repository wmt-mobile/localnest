---
name: localnest:search
description: Search codebase and memory via LocalNest
argument-hint: "<query>"
allowed-tools:
  - Read
  - Bash
  - Glob
  - Grep
---

<objective>
Search across code and memory using LocalNest's hybrid retrieval.
</objective>

<process>
1. Use $ARGUMENTS as the search query.
2. First, call `localnest_search_files` to find files matching the query.
3. If results are sparse, call `localnest_search_code` with the query for exact symbol matching.
4. If memory is enabled, also call `localnest_memory_recall` to surface relevant memories.
5. If knowledge graph has related entities, call `localnest_kg_query` for structured facts.
6. Present results grouped by source (code files, memories, KG facts).
</process>
