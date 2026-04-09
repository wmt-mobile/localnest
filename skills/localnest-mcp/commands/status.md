---
name: localnest:status
description: Check LocalNest server health, memory, and KG status
allowed-tools:
  - Read
  - Bash
---

<objective>
Show a comprehensive status of the LocalNest MCP server.
</objective>

<process>
1. Call `localnest_server_status` for runtime info.
2. Call `localnest_memory_status` for memory backend status.
3. Call `localnest_kg_stats` for knowledge graph statistics.
4. Call `localnest_hooks_stats` for hook system status.
5. Present a clear summary:
   - Server version and health
   - Memory: enabled/disabled, backend, entry count
   - Knowledge Graph: entity count, triple count
   - Hooks: registered listener count
   - Index: backend type, freshness
</process>
