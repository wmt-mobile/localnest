# Vault Sync Research — Collected Findings

## Market Context

- Nobody owns "local-only AI memory with good human UI" space
- Mem0 ($24M) is cloud-primary, Basic Memory uses Obsidian but has no KG
- The gap: beautiful local-only dashboard for AI memories + knowledge graph
- AI agent market crossed $7.6B in 2025, projected $50B by 2030

## Competitive Analysis

| Tool | Approach | Bidirectional? | KG? |
|---|---|---|---|
| Basic Memory | Markdown files = source of truth, SQLite = derived index | No (files → DB only) | No |
| Letta-Obsidian | Plugin, mtime + size comparison, flattened dirs | No (vault → Letta only) | No |
| MegaMem | Vault → SQLite KG with content hashing | No (vault → DB only) | Code-only |
| Obsidian Memory MCP | Individual .md files with YAML frontmatter | No (write-only) | No |
| **LocalNest (planned)** | **Sync daemon, trigger-based outbox, @parcel/watcher** | **Yes** | **Yes** |

## Technical Decisions (with rationale)

### File Watcher: @parcel/watcher over chokidar

- `writeSnapshot` / `getEventsSince` — crash recovery without full directory diff
- C++ throttling — bulk writes (500 memories) coalesced at native layer
- Single event per file — no create+change double-fire
- Used by VS Code, Tailwind, Nx, Nuxt

### YAML: gray-matter + regex surgery (NOT parse+stringify)

**Critical gotcha:** gray-matter does NOT perfectly round-trip YAML:
- Comments stripped (js-yaml limitation, issue #689)
- Key order may change
- Quoting style changes

**Safe pattern:** `matter(input).matter` gives raw YAML string. Modify fields via regex:
```typescript
const fieldRegex = new RegExp(`^(${key}\\s*:)(.*)$`, 'm');
newYaml = yamlBlock.replace(fieldRegex, `$1 ${value}`);
```

Only use `matter.stringify()` for NEW files.

### SQLite Change Detection: Trigger-based outbox

- `better-sqlite3` does NOT expose `sqlite3_update_hook()` — can't use it
- `PRAGMA data_version` polling works but doesn't tell you WHICH rows changed
- Trigger-based `_sync_outbox` table: captures exact table + row_id + operation
- Survives daemon restarts, no polling lag, no missed changes

### Debounce: 4 seconds

- Obsidian auto-saves every 2 seconds during typing
- 4s guarantees we see final state after user pauses
- @parcel/watcher coalesces rapid events at C++ level anyway

### Conflict Resolution: Vault (user) always wins

- User intent is sacred — if they edited a memory, that's the truth
- AI can re-learn from context; user edits are deliberate
- Log conflicts for audit trail

## Frontmatter Contract

### Memory files
```yaml
---
localnest_id: "mem_a1b2c3d4"
localnest_hash: "e5f6a7b8"
localnest_synced_at: 2026-04-16T10:30:00Z
type: memory
kind: knowledge
importance: 85
confidence: 0.9
nest: moovr-driver
branch: dashboard
tags: [flutter, rxdart, state-management]
recall_count: 42
created: 2026-03-13T09:08:31.060Z
---
```

### Entity files
```yaml
---
localnest_id: "flutter"
localnest_hash: "a3b4c5d6"
localnest_synced_at: 2026-04-16T10:30:00Z
type: entity
entity_type: technology
connections: 53
created: 2026-04-09T11:23:50.739Z
---
```

### Predicate files
```yaml
---
localnest_id: "pred_uses"
localnest_hash: "f7g8h9i0"
localnest_synced_at: 2026-04-16T10:30:00Z
type: predicate
count: 93
---
```

## Write-Gate + Marker Strategy (two-layer)

**Layer 1: In-memory write-gate** (immediate, prevents echo)
- `Set<string>` of paths we're currently writing to
- Cleared after 1s timeout
- Fast check on every watcher event

**Layer 2: Frontmatter hash marker** (survives daemon restart)
- `localnest_hash` = SHA-256 prefix (8 chars) of markdown body
- On file event: if hash matches, content unchanged → ignore
- If hash differs → real user edit → sync back to SQLite

## Obsidian Vault Conventions

- Subfolder inside existing vault works perfectly
- Graph view shows links across ALL folders (wikilinks are vault-wide)
- Search indexes all subfolders automatically
- NO `.obsidian` folder inside AI-Brain/ (causes indexer stalls)
- No config changes needed to add synced folders

## Performance Notes

- At 1,000-5,000 memory files: negligible perf impact on Obsidian
- Mobile (Obsidian Sync): works up to ~10K notes, degrades at 40K+
- SQLite trigger overhead: negligible for LocalNest's write frequency
- @parcel/watcher memory: ~5MB for 5,000 watched files

## Sources

Key references (full URLs in deep-research session):
- Basic Memory sync architecture (DeepWiki analysis)
- @parcel/watcher vs chokidar benchmarks (Eleventy #3149)
- gray-matter round-trip limitations (js-yaml #689)
- Obsidian auto-save behavior (forum.obsidian.md)
- SQLite data_version vs update_hook (sqlite.org/forum)
- EVC Local Sync plugin (entire-vc/evc-local-sync-plugin)
- MCP token efficiency research (Anthropic, Atlassian, OnlyCLI, Scalekit)
