# Tool Reference

## Server and runtime

### `localnest_server_status`
Returns runtime config: active roots, ripgrep status, index backend (`sqlite-vec` or `json`), chunk settings, and update status metadata. Always call first in a new session.

### `localnest_health`
Returns a compact runtime health summary for fast smoke checks. Prefer this when you only need a quick runtime answer rather than the full server status payload.

### `localnest_usage_guide`
Returns structured best-practice guidance for users and AI agents. No params. Call this when unsure about the correct workflow.

### `localnest_update_status`
Checks npm for latest package version with local caching (default interval 120 minutes). Params: `force_check` (bool, default false). Use this to decide whether to ask user to update.

### `localnest_update_self`
Performs global self-update and skill sync. Params:
- `approved_by_user` (required safety gate; must be true)
- `dry_run` (bool, default false)
- `version` (default `latest`)
- `reinstall_skill` (bool, default true)

This tool should only be called after explicit user approval and is intended for npm-installed LocalNest packages.

## Workspace and file discovery

### `localnest_list_roots`
Lists configured roots. Supports `limit` / `offset` pagination.

### `localnest_list_projects`
Lists first-level projects under a root. Params: `root_path` (optional), `limit`, `offset`.

### `localnest_project_tree`
Returns compact file/folder tree. Params: `project_path` (required), `max_depth` (1–8, default 3), `max_entries` (default 1500). Start with low `max_depth`, expand if needed.

### `localnest_read_file`
Reads a bounded line window from a file with line numbers. Params: `path`, `start_line` (default 1), `end_line` (default cap). Window is capped at 800 lines. Read narrow ranges first, then expand.

### `localnest_summarize_project`
High-level summary: language breakdown, extension stats, file counts. Params: `project_path` (required), `max_files` (default 3000).

## Index and embedding state

### `localnest_index_status`
Returns semantic index metadata (exists, stale, backend, file count). Use before indexing.

If `backend=json` and `upgrade_recommended=true`, move to `sqlite-vec` for better scale/performance.

### `localnest_embed_status`
Returns active embedding backend/model status and vector-search readiness. Use this when hybrid search quality is weak, embeddings appear unavailable, or you need to confirm the current provider/model before indexing.
Interpretation note:
- `enabled=true` means the feature is configured.
- `available=true` means the model has loaded successfully in the current runtime.

### `localnest_index_project`
Builds or refreshes semantic index. Params:
- `project_path` (optional) — scope to one project
- `all_roots` (bool, default false) — index all roots
- `force` (bool, default false) — rebuild even if fresh
- `max_files` (default 20000) — cap on files indexed

Prefer project-scoped over all-roots for speed. Returns `failed_files: [{path, error}]` for files that could not be indexed while still committing the rest.

## Search and code navigation

### `localnest_search_files`
Searches file paths and names for a query string. Use this first when looking for a module or feature by name. Params: `query` (required), `project_path` (optional), `all_roots`, `max_results`, `case_sensitive`.

### `localnest_search_code`
Lexical search (ripgrep or JS fallback). Best for exact symbol names, identifiers, error strings, or regex patterns. Params:
- `query`
- `project_path`
- `all_roots`
- `glob`
- `max_results`
- `case_sensitive`
- `use_regex`
- `context_lines`

### `localnest_search_hybrid`
Lexical + semantic search with RRF ranking. Best for concept-level or natural-language queries. Requires `localnest_index_project` to have been run first. Params:
- `query`
- `project_path`
- `all_roots`
- `glob`
- `max_results`
- `case_sensitive`
- `min_semantic_score`
- `auto_index`
- `use_reranker`

### `localnest_get_symbol`
Symbol definition/export lookup. Use this first for “where is X defined/exported?” questions.

### `localnest_find_usages`
Symbol usage lookup for imports and call sites. Use this for “where is X used/called/imported?” questions.

## Memory workflow

### `localnest_memory_status`
Returns memory consent state, backend compatibility, active database path, and store status. Call before using memory tools.

### `localnest_task_context`
Returns runtime status, memory state, and relevant recall in one call. Prefer this over manually chaining memory tools for non-trivial tasks.

### `localnest_memory_recall`
Recalls the most relevant local memories for a task/query. Use at the start of substantive tasks when memory is enabled.

### `localnest_capture_outcome`
Captures a meaningful task outcome with a simpler payload and forwards it into the memory event pipeline. Prefer this over `localnest_memory_capture_event` when you do not need low-level control.

### `localnest_memory_capture_event`
Background event ingest tool for automatic memory flow.

### `localnest_memory_events`
Lists recent memory capture events and whether they were promoted into durable memory.

### `localnest_memory_list`
Lists stored memories with filters.

### `localnest_memory_get`
Fetches a memory entry with revision history.

### `localnest_memory_store`
Manual durable memory write. Use for explicit corrections or when automatic capture is not appropriate.

### `localnest_memory_update`
Updates a memory and appends a revision.

### `localnest_memory_delete`
Deletes a memory entry and all its revisions. Also removes all graph relations connected to that entry.

## Memory graph tools

### `localnest_memory_suggest_relations`
Finds semantically similar memories that could be linked to a given memory.

### `localnest_memory_add_relation`
Links two memory entries with a named relation. Recommended values: `related`, `depends_on`, `contradicts`, `supersedes`, `extends`.

### `localnest_memory_remove_relation`
Removes a specific directed relation between two memory entries.

### `localnest_memory_related`
Traverses the knowledge graph one hop in both directions from a given memory.
