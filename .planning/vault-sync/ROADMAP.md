# Vault Sync Roadmap — v0.4.0

## Phase 1: Foundation — Export Engine (Node.js rewrite)
**Goal:** Replace bash export script with a proper Node.js export engine. `localnest sync --init` populates a vault folder from SQLite.
**Depends on:** Nothing
**Effort:** 3-4 days

### Tasks
1. **Vault writer module** (`src/services/vault-sync/vault-writer.ts`)
   - Write memory entries as .md files with YAML frontmatter
   - Write KG entities as .md files with `[[wikilinks]]` for relationships
   - Write predicate index files
   - Write MOC index file with stats
   - Sanitize filenames (no `/:*?"<>|` chars)
   - Add `localnest_id` and `localnest_hash` frontmatter markers

2. **CLI command** (`localnest sync --init --vault <path>`)
   - Accept vault path argument
   - Validate path exists and is writable
   - Create AI-Brain/ subfolder structure
   - Run full export
   - Report: X memories, Y entities, Z predicates exported

3. **Frontmatter contract**
   - Define the YAML frontmatter schema for each file type
   - `localnest_id`, `localnest_hash`, `localnest_synced_at` on every file
   - Entity-specific: `entity_type`, `entity_id`, `connections`
   - Memory-specific: `kind`, `importance`, `confidence`, `nest`, `branch`, `tags`
   - Predicate-specific: `count`

### Acceptance
- `localnest sync --init --vault /tmp/test-vault` creates a valid Obsidian vault
- Opening the vault in Obsidian shows graph with connected entities
- All files have correct frontmatter markers
- No `.obsidian` folder created inside AI-Brain/

---

## Phase 2: SQLite → Vault Live Sync
**Goal:** When the AI stores a memory or adds a KG entity via MCP, it automatically appears in the Obsidian vault within seconds.
**Depends on:** Phase 1
**Effort:** 1 week

### Tasks
1. **Sync outbox triggers** (SQLite migration)
   - Create `_sync_outbox` table
   - Add INSERT/UPDATE/DELETE triggers on `memory_entries`
   - Add INSERT/UPDATE/DELETE triggers on `kg_entities`
   - Add INSERT/DELETE triggers on `kg_triples`

2. **Outbox poller** (`src/services/vault-sync/outbox-poller.ts`)
   - Poll `_sync_outbox` every 2 seconds
   - Batch process pending rows
   - Call vault-writer for each changed row
   - Mark rows as synced
   - Write-gate: track files we're writing to prevent echo

3. **Daemon mode** (`localnest sync --vault <path> --daemon`)
   - Background process (daemonize with proper PID file)
   - Outbox poller running continuously
   - Graceful shutdown on SIGTERM/SIGINT
   - Log to `~/.localnest/logs/vault-sync.log`

4. **Incremental updates**
   - Detect which fields changed (not just "row changed")
   - For memory updates: re-export only if title/content/importance changed
   - For entity updates: re-export if name/type/connections changed
   - For triple changes: re-export both subject and object entities (connections changed)

### Acceptance
- Start daemon, store a memory via MCP → .md file appears in vault within 5s
- Add a KG triple via MCP → both entity files update with new relationship
- Delete a memory via MCP → .md file removed from vault
- Daemon restart → catches up on missed changes via outbox

---

## Phase 3: Vault → SQLite Sync
**Goal:** When the user edits a note in Obsidian or creates a new .md file in AI-Brain/, the changes flow back to SQLite for the AI to recall.
**Depends on:** Phase 2
**Effort:** 1.5 weeks

### Tasks
1. **File watcher setup** (`src/services/vault-sync/vault-watcher.ts`)
   - @parcel/watcher subscription on the AI-Brain/ folder
   - Ignore `.obsidian`, `.trash`, `*.tmp`
   - 4-second debounce per file (Obsidian auto-saves every 2s)
   - Snapshot save/restore for crash recovery

2. **Change classifier**
   - Check write-gate (ignore our own writes)
   - Parse frontmatter for `localnest_id` and `localnest_hash`
   - Classify: `ignore` | `user_edit` | `new_file` | `deleted`
   - Hash comparison: SHA-256 prefix of body vs stored hash

3. **Write-back handlers**
   - `user_edit` on memory: update title, content, tags, importance in SQLite
   - `user_edit` on entity: update name, type in SQLite
   - `new_file` in memories/: create new memory_entry in SQLite, assign localnest_id
   - `new_file` in entities/: create new kg_entity in SQLite
   - `deleted`: soft-delete (archive) in SQLite, log the deletion
   - After write-back: update frontmatter markers (localnest_id, hash, synced_at)

4. **Wiki-link → triple parsing**
   - Parse `[[wikilinks]]` from entity files
   - Diff against existing triples
   - User adds `[[React Native]]` to an entity → create triple
   - User removes a wikilink → invalidate triple
   - Predicate inference: default to `related_to` for user-created links

### Acceptance
- Edit a memory's content in Obsidian → `memory_recall` returns updated content
- Create a new .md in memories/ with no frontmatter → new memory appears in SQLite with auto-assigned ID
- Delete a file → memory archived in SQLite
- Add `[[NewTech]]` to an entity → new entity + triple created in KG
- All changes survive daemon restart (snapshot-based recovery)

---

## Phase 4: Polish & Edge Cases
**Goal:** Conflict handling, daily activity notes, robustness, cross-platform testing.
**Depends on:** Phase 3
**Effort:** 1 week

### Tasks
1. **Conflict resolution**
   - Detect when both sides changed since last sync
   - Vault wins (user intent is sacred)
   - Log conflicts to `~/.localnest/logs/sync-conflicts.log`
   - Optional: create `.conflict` backup file before overwriting

2. **Daily activity notes**
   - Auto-append agent events to `AI-Brain/activity/{YYYY-MM-DD}.md`
   - Format: time + event type + summary (one line per event)
   - Link to relevant memories/entities via wikilinks
   - Integrates with Obsidian's Daily Notes plugin

3. **Circuit breaker**
   - Files that fail 3 consecutive times → skip until content changes
   - Corrupt YAML frontmatter → skip file, log warning
   - SQLite write failure → retry with backoff, then skip

4. **Cross-platform testing**
   - Test on Linux (native inotify via @parcel/watcher)
   - Test on macOS (FSEvents)
   - Test on Windows (ReadDirectoryChangesW)
   - File path sanitization for all platforms

5. **Status & diagnostics**
   - `localnest sync --status` → show daemon PID, vault path, last sync, pending outbox count
   - `localnest sync --stats` → files synced, conflicts, errors
   - Health check in `localnest doctor`

### Acceptance
- Both sides change same memory → vault wins, conflict logged
- Agent stores 50 memories in 10 seconds → all appear in vault without corruption
- Daemon runs for 24h without memory leak or crash
- Works on Linux + macOS + Windows
- `localnest doctor` reports vault sync health

---

## Dependency Graph

```
Phase 1 (Foundation)
    │
    ▼
Phase 2 (SQLite → Vault)
    │
    ▼
Phase 3 (Vault → SQLite)
    │
    ▼
Phase 4 (Polish)
```

Strict sequence — each phase depends on the previous.

## New Dependencies

| Package | Purpose | Size |
|---|---|---|
| `@parcel/watcher` | Native file watching with snapshot/resume | ~2MB (prebuilt binary) |
| `gray-matter` | YAML frontmatter parsing | ~50KB |

No other new dependencies. SQLite access reuses existing `node:sqlite` / better-sqlite3.
