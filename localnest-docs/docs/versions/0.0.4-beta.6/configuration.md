# 0.0.4-beta.6 Configuration

<div className="docPanel docPanel--compact">
  <p>
    Beta.6 keeps the same configuration model as beta.5 while improving runtime diagnostics,
    installed-runtime validation, and current-versus-archived release guidance.
  </p>
</div>

## Core config model

- `PROJECT_ROOTS` -> highest priority runtime root override
- `LOCALNEST_CONFIG` -> explicit config file path
- working directory fallback -> used only when neither override is set

## Beta.6 configuration notes

| Setting | Expected beta.6 behavior |
| --- | --- |
| MCP startup command | prefer `localnest-mcp` directly when installed globally |
| Startup timeout | keep `startup_timeout_sec` at `30` or higher |
| Index backend | `sqlite-vec` preferred, JSON fallback still supported |
| Memory database | `~/.localnest/data/localnest.memory.db` when memory is enabled |
| Setup output | generated MCP config lives under `~/.localnest/config/` |
| Runtime diagnostics | richer `localnest_server_status` and `localnest_health` output |

## Important environment variables

| Variable | Default | Description |
| --- | --- | --- |
| `LOCALNEST_CONFIG` | `~/.localnest/config/localnest.config.json` | explicit config file path |
| `LOCALNEST_INDEX_BACKEND` | `sqlite-vec` | requested retrieval backend |
| `LOCALNEST_DB_PATH` | `~/.localnest/data/localnest.db` | retrieval database path |
| `LOCALNEST_INDEX_PATH` | `~/.localnest/data/localnest.index.json` | JSON index path |
| `LOCALNEST_MEMORY_ENABLED` | `false` | enable memory subsystem |
| `LOCALNEST_MEMORY_BACKEND` | `auto` | memory backend selection |
| `LOCALNEST_MEMORY_DB_PATH` | `~/.localnest/data/localnest.memory.db` | memory database path |

All core retrieval settings from the stable and surrounding beta lines still apply.
