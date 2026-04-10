---
name: localnest:remember
description: Save a decision, fact, or learning to LocalNest memory
argument-hint: "<what to remember>"
allowed-tools:
  - Read
  - Bash
  - mcp__localnest__localnest_memory_store
  - mcp__localnest__localnest_memory_suggest_relations
  - mcp__localnest__localnest_memory_add_relation
---

<objective>
Store a durable memory entry in LocalNest so it can be recalled in future sessions.
</objective>

<process>
1. Parse $ARGUMENTS as the content to remember.
2. Determine the best memory kind:
   - If it's a decision → kind: "decision"
   - If it's a preference → kind: "preference"
   - If it's a fact/learning → kind: "knowledge"
   - If it's a bug fix or solution → kind: "knowledge"
3. Generate a concise title from the content.
4. Call `localnest_memory_store` with the appropriate kind, title, and content.
5. After storing, call `localnest_memory_suggest_relations` on the new memory ID to find related memories.
6. If strong matches found (similarity >= 0.7), call `localnest_memory_add_relation` to link them.
7. Report what was stored and any relations created.
</process>
