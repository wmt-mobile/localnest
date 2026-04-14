# Tools Overview (74 Tools)

<div className="docPanel docPanel--compact">
  <p>
    LocalNest provides a comprehensive suite of <strong>74 MCP tools</strong> designed for local-first AI engineering. Use them in layers: start with <strong>Agent Prime</strong> for unified context, use <strong>Fused Search</strong> to find information across domains, and leverage <strong>Batch Operations</strong> for high-performance memory management.
  </p>
</div>

## 🏗️ Core Toolsets

<div className="docGrid docGrid--2">
  <div className="docPanel">
    <h3>🚀 Agentic Workflow (NEW)</h3>
    <p>Unified context and proactive guidance.</p>
    <ul>
      <li>`localnest_agent_prime` — Context in 1 call</li>
      <li>`localnest_find` — Fused cross-domain search</li>
      <li>`localnest_whats_new` — Session deltas</li>
      <li>`localnest_help` — Task-scoped guidance</li>
      <li>`localnest_teach` — Behavior modifiers</li>
      <li>`localnest_audit` — Health dashboard</li>
      <li>`localnest_file_changed` — Proactive hints</li>
    </ul>
  </div>
  <div className="docPanel">
    <h3>🔍 Code Intelligence</h3>
    <p>Symbol-aware analysis and navigation.</p>
    <ul>
      <li>`localnest_find_callers`</li>
      <li>`localnest_find_definition`</li>
      <li>`localnest_find_implementations`</li>
      <li>`localnest_rename_preview`</li>
      <li>`localnest_get_symbol`</li>
      <li>`localnest_find_usages`</li>
    </ul>
  </div>
  <div className="docPanel">
    <h3>📦 Batch Operations</h3>
    <p>High-performance bulk writes (500/call).</p>
    <ul>
      <li>`localnest_kg_add_entities_batch`</li>
      <li>`localnest_kg_add_triples_batch`</li>
      <li>`localnest_memory_store_batch`</li>
      <li>`localnest_memory_delete_batch`</li>
      <li>`localnest_kg_delete_entities_batch`</li>
      <li>`localnest_kg_delete_triples_batch`</li>
    </ul>
  </div>
  <div className="docPanel">
    <h3>🧠 Persistent Memory</h3>
    <p>Durable knowledge base for AI agents.</p>
    <ul>
      <li>`localnest_task_context`</li>
      <li>`localnest_memory_recall`</li>
      <li>`localnest_memory_get` / `list`</li>
      <li>`localnest_memory_store` / `update`</li>
      <li>`localnest_capture_outcome`</li>
      <li>`localnest_memory_related`</li>
      <li>`localnest_memory_suggest_relations`</li>
    </ul>
  </div>
  <div className="docPanel">
    <h3>🕸️ Knowledge Graph</h3>
    <p>Temporal facts and multi-hop relationships.</p>
    <ul>
      <li>`localnest_kg_add_entity`</li>
      <li>`localnest_kg_add_triple`</li>
      <li>`localnest_kg_query` / `timeline`</li>
      <li>`localnest_kg_invalidate`</li>
      <li>`localnest_kg_as_of`</li>
      <li>`localnest_graph_traverse`</li>
      <li>`localnest_graph_bridges`</li>
    </ul>
  </div>
  <div className="docPanel">
    <h3>📂 Workspace & Discovery</h3>
    <p>File system and project awareness.</p>
    <ul>
      <li>`localnest_list_roots`</li>
      <li>`localnest_list_projects`</li>
      <li>`localnest_project_tree`</li>
      <li>`localnest_read_file`</li>
      <li>`localnest_summarize_project`</li>
      <li>`localnest_project_backfill`</li>
    </ul>
  </div>
</div>

---

## 🚦 Choosing the Right Tool

| Goal | Primary Tool | Advantage |
| --- | --- | --- |
| **Start a task** | `localnest_agent_prime` | Returns memories, entities, files, and actions in one call. |
| **Search everything** | `localnest_find` | Fused RRF ranking across memory, code, and KG. |
| **Navigate code** | `localnest_find_definition` | Jumps straight to the source of any symbol. |
| **Set a preference** | `localnest_teach` | Stores a behavior modifier that surfaces in future tasks. |
| **Bulk migration** | `localnest_kg_add_triples_batch` | Processes up to 500 facts in a single transaction. |
| **Check health** | `localnest_audit` | Comprehensive visual score of your AI's knowledge base. |

---

## 🛠️ Typical Agentic Workflow

1.  **Context Rehydration**: Use `localnest_agent_prime` to get up to speed on the current task.
2.  **Discovery**: Use `localnest_find` to locate relevant modules or memories.
3.  **Deep Dive**: Use `localnest_find_callers` or `localnest_read_file` for implementation details.
4.  **Action**: Perform the task (edit files, fix bugs).
5.  **Documentation**: Use `localnest_capture_outcome` to persist what was learned.
6.  **Refinement**: Use `localnest_teach` to store new behavioral rules for next time.

---

:::tip Maintainer Note
This list is a summary. For the full technical specification of all 74 tools, including input schemas and return types, please refer to the individual tool documentation pages.
:::
