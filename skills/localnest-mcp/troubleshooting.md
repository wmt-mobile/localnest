# Troubleshooting

## Doctor fails with MCP SDK import error

Symptom: `sdk_import` check fails (`ERR_MODULE_NOT_FOUND`).

Fix:
```bash
npm install
localnest-mcp-doctor
```

## ripgrep missing

Ripgrep is optional. If `rg` is not found, the server still starts and search tools fall back to a JS filesystem walker.

To get full performance:
- macOS: `brew install ripgrep`
- Linux: `sudo apt-get install ripgrep`
- Windows: `winget install BurntSushi.ripgrep.MSVC`

## File exceeds size cap in `read_file`

LocalNest caps reads at 800 lines per window. Narrow your `start_line` / `end_line` range.

## MCP startup timeout

If the client times out, set:

```toml
[mcp_servers.localnest]
startup_timeout_sec = 30
```

## Semantic search returns no results

Check:
- `localnest_index_status`
- `localnest_embed_status`

Then rebuild with:

```bash
localnest_index_project
```

## glob `*.ts` returns no results from subdirectories

Use `**/*.ts` instead of `*.ts`.

## sqlite-vec unavailable

LocalNest auto-falls back to JSON backend. Confirm via:
- `localnest_server_status`
- `localnest_index_status`

## Memory disabled or unavailable

Check:
- `localnest_memory_status`

Common causes:
- user did not opt in during setup
- memory backend unavailable on the current runtime

## Duplicate-looking tools in MCP clients

Stable releases expose canonical `localnest_*` tools only.
