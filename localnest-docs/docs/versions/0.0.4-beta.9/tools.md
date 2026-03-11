# 0.0.4-beta.9 Tools

<div className="docPanel docPanel--compact">
  <p>
    Beta.9 keeps the retrieval and memory tool surface from beta.8 while fixing bundled-skill
    version reporting and package metadata alignment.
  </p>
</div>

## Core tools present in this beta

- `localnest_usage_guide`
- `localnest_server_status`
- `localnest_health`
- `localnest_list_roots`
- `localnest_list_projects`
- `localnest_project_tree`
- `localnest_index_status`
- `localnest_index_project`
- `localnest_search_files`
- `localnest_search_code`
- `localnest_search_hybrid`
- `localnest_get_symbol`
- `localnest_find_usages`
- `localnest_read_file`
- `localnest_summarize_project`

## Memory and update tools present in this beta

- `localnest_task_context`
- `localnest_memory_status`
- `localnest_memory_recall`
- `localnest_memory_list`
- `localnest_memory_get`
- `localnest_memory_store`
- `localnest_memory_update`
- `localnest_memory_delete`
- `localnest_capture_outcome`
- `localnest_memory_capture_event`
- `localnest_memory_events`
- `localnest_update_status`
- `localnest_update_self`

## Recommended beta.9 workflow

`localnest_server_status` -> `localnest_task_context` -> `localnest_search_files` -> `localnest_search_code` or `localnest_search_hybrid` -> `localnest_read_file` -> `localnest_capture_outcome`
