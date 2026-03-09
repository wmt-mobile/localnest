# LocalNest Installed Beta.5 Release Test Report

Date: 2026-03-09T05:28:53.170Z
Host: wmt-jenilg
Project: /mnt/da2ae3dd-9788-4b37-88e8-effd7025eb4c/Base Projects/localnest
Installed runtime: localnest 0.0.4-beta.5

## Scope

- Target runtime: globally installed `localnest-mcp`
- Version under test: `0.0.4-beta.5`
- Transport: MCP stdio handshake against installed binary
- Config: `/home/jenil-d-gohel/.localnest/config/localnest.config.json`

## Summary

- PASS: 33
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
| localnest_project_tree | PASS | 0 top-level entries |
| localnest_index_status | PASS | backend=sqlite-vec, total_files=28014 |
| localnest_embed_status | PASS | ready=, provider= |
| localnest_index_project | PASS | indexed_files=undefined, failed_files=0 |
| localnest_search_files | PASS | 0 matches |
| localnest_search_code | PASS | 0 matches |
| localnest_search_hybrid | PASS | ranking_mode=hybrid, results=5 |
| localnest_get_symbol | PASS | definitions=0, exports=1 |
| localnest_find_usages | PASS | usages=5 |
| localnest_read_file | PASS | 0 lines returned |
| localnest_summarize_project | PASS | {"path":"/mnt/da2ae3dd-9788-4b37-88e8-effd7025eb4c/Base Projects/localnest","directories":43,"files_counted":151,"top_extensions":[{"ext":".js","count":74},{"ext":".md","count":51},{"ext":".mjs","count":11},{"ext":".json... |
| localnest_memory_status | PASS | enabled=true, backend=auto |
| localnest_task_context | PASS | recall=5 |
| localnest_memory_recall | PASS | count=5 |
| localnest_memory_store A | PASS | id=undefined |
| localnest_memory_store B | PASS | id=undefined |
| localnest_memory_list | PASS | count=8 |
| localnest_memory_get | PASS | title=undefined |
| localnest_memory_update | PASS | id=undefined |
| localnest_memory_suggest_relations | PASS | suggestions=0 |
| localnest_memory_add_relation | PASS | undefined -> undefined |
| localnest_memory_related | PASS | related=0 |
| localnest_memory_remove_relation | PASS | removed=undefined |
| localnest_memory_capture_event | PASS | status=ignored |
| localnest_memory_events | PASS | count=5 |
| localnest_capture_outcome | PASS | captured=true |
| localnest_update_status | PASS | current=, latest=, outdated=false |
| localnest_update_self | SKIP | Skipped in release sweep because self-update mutates the installed global runtime. |

## Notes

- `localnest_update_self` was intentionally skipped because it mutates the live global install and is not appropriate for a release verification sweep.
- Memory store/update/relation/delete flow was exercised against the real installed memory backend, then cleaned up for the temporary entries created by this test.
- Event-based workflow tools create history entries by design; those are not deleted by this sweep.

## Stderr

```text
(node:120710) ExperimentalWarning: SQLite is an experimental feature and might change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
```
