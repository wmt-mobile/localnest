# 0.0.4-beta.9 Configuration

<div className="docPanel docPanel--compact">
  <p>
    Beta.9 keeps the beta.8 runtime/configuration baseline while tightening packaged-skill version
    alignment and install/reporting behavior.
  </p>
</div>

## Core config model

- `PROJECT_ROOTS` -> highest priority runtime root override
- `LOCALNEST_CONFIG` -> explicit config file path
- working directory fallback -> used only when neither override is set

## Beta.9 configuration notes

| Setting | Expected beta.9 behavior |
| --- | --- |
| MCP startup command | prefer `localnest-mcp` directly when installed globally |
| Startup timeout | keep `startup_timeout_sec` at `30` or higher |
| Index backend | `sqlite-vec` preferred, JSON fallback still supported |
| sqlite extension | auto-detected when possible, explicit path override supported |
| Embedding runtime | Hugging Face provider/model is the intended runtime path |
| Skill sync command | prefer `localnest install skills`, legacy alias still supported |
| Memory database | `~/.localnest/data/localnest.memory.db` when memory is enabled |

## Important environment variables

| Variable | Default | Description |
| --- | --- | --- |
| `LOCALNEST_CONFIG` | `~/.localnest/config/localnest.config.json` | explicit config file path |
| `LOCALNEST_INDEX_BACKEND` | `sqlite-vec` | requested retrieval backend |
| `LOCALNEST_DB_PATH` | `~/.localnest/data/localnest.db` | retrieval database path |
| `LOCALNEST_INDEX_PATH` | `~/.localnest/data/localnest.index.json` | JSON index path |
| `LOCALNEST_SQLITE_VEC_EXTENSION` | auto-detected | explicit sqlite-vec native extension path |
| `LOCALNEST_MEMORY_ENABLED` | `false` | enable memory subsystem |
| `LOCALNEST_MEMORY_BACKEND` | `auto` | memory backend selection |
| `LOCALNEST_MEMORY_DB_PATH` | `~/.localnest/data/localnest.memory.db` | memory database path |

All core retrieval settings from surrounding beta lines still apply.
