# LocalNest Installed Beta.5 Release Test Report

Date: 2026-03-09T08:23:39.539Z
Host: wmt-jenilg
Project: /mnt/da2ae3dd-9788-4b37-88e8-effd7025eb4c/Base Projects/localnest
Installed runtime: localnest 0.0.4-beta.5

## Scope

- Target runtime: globally installed `localnest-mcp`
- Version under test: `0.0.4-beta.5`
- Transport: MCP stdio handshake against installed binary
- Config: `/home/jenil-d-gohel/.localnest/config/localnest.config.json`

## Summary

- PASS: 43
- WARN: 0
- FAIL: 0
- SKIP: 1
- Exposed MCP tools: 32

## Results

| Check | Status | Details |
|---|---|---|
| MCP initialize | PASS | localnest 0.0.4-beta.5 |
| tools/list | PASS | 32 tools exposed |
| localnest_server_status | PASS | version=0.0.4-beta.5, roots=1, backend=sqlite-vec |
| localnest_usage_guide | PASS | {"for_users":["Run localnest_list_roots first to verify active roots.","Use localnest_list_projects to discover projects under a root.","Run localnest_index_project for your active project/root before semantic search.","... |
| localnest_list_roots | PASS | 1 roots |
| localnest_list_projects | PASS | 14 first-level projects |
| localnest_project_tree | PASS | 83 top-level entries |
| localnest_index_status | PASS | backend=sqlite-vec, total_files=33105 |
| localnest_embed_status | PASS | ready=, provider= |
| localnest_index_project | PASS | skipped (existing_index_available), total_files=33105 |
| localnest_search_files | PASS | 3 matches |
| localnest_search_code | PASS | 5 matches |
| localnest_search_hybrid | PASS | ranking_mode=hybrid, results=5 |
| localnest_get_symbol | PASS | definitions=0, exports=1 |
| localnest_find_usages | PASS | usages=5 |
| localnest_read_file | PASS | 20 lines returned |
| localnest_summarize_project | PASS | {"path":"/mnt/da2ae3dd-9788-4b37-88e8-effd7025eb4c/Base Projects/localnest","directories":42,"files_counted":157,"top_extensions":[{"ext":".js","count":78},{"ext":".md","count":53},{"ext":".mjs","count":11},{"ext":".json... |
| localnest_memory_status | PASS | enabled=true, backend=auto |
| localnest_task_context | PASS | recall=0 |
| localnest_memory_recall | PASS | count=0 |
| localnest_task_context empty-memory | PASS | recall=0, attempted=true |
| localnest_memory_recall empty-memory | PASS | count=0 |
| localnest_memory_store A | PASS | id=mem_057cbffb755e441b8355d3f8d7c49c73 |
| localnest_memory_store B | PASS | id=mem_8251fa6a9f9d42fdb85df7b8bbab1118 |
| localnest_memory_list | PASS | count=2 |
| localnest_memory_get | PASS | title=beta5 release smoke temp A |
| localnest_memory_update | PASS | id=mem_057cbffb755e441b8355d3f8d7c49c73 |
| localnest_memory_suggest_relations | PASS | suggestions=1 |
| localnest_memory_add_relation | PASS | mem_057cbffb755e441b8355d3f8d7c49c73 -> mem_8251fa6a9f9d42fdb85df7b8bbab1118 |
| localnest_memory_related | PASS | related=1 |
| localnest_memory_remove_relation | PASS | removed=true |
| localnest_memory_capture_event | PASS | status=ignored |
| localnest_memory_events | PASS | count=1 |
| localnest_capture_outcome | PASS | captured=true |
| localnest_memory_status disabled-memory | PASS | enabled=false |
| localnest_task_context disabled-memory | PASS | reason=memory_disabled |
| localnest_capture_outcome disabled-memory | PASS | captured=false, reason=memory_disabled |
| localnest_memory_status backend-unavailable | PASS | backend_available=false, selected= |
| localnest_task_context backend-unavailable | PASS | reason=backend_unavailable |
| localnest_capture_outcome backend-unavailable | PASS | captured=false, reason=backend_unavailable |
| localnest_update_status | PASS | current=, latest=, outdated=false |
| localnest_update_self | SKIP | Skipped in release sweep because self-update mutates the installed global runtime. |
| localnest_memory_delete A | PASS | deleted=true |
| localnest_memory_delete B | PASS | deleted=true |

## Notes

- `localnest_update_self` was intentionally skipped because it mutates the live global install and is not appropriate for a release verification sweep.
- Memory store/update/relation/delete flow was exercised against an isolated temporary memory database, then cleanup was verified for the temporary entries created by this test.
- Event-based workflow tools in this sweep used the isolated temporary memory database rather than the user's real event log.
- Cleanup verified: temporary memory deleted=true

## Stderr

```text
(node:410602) ExperimentalWarning: SQLite is an experimental feature and might change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
```
