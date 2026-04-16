# LocalNest v0.4.0 — One Brain + Lean Engine

**Branch:** `feature/vault-sync`
**Status:** Planning

## Vision

Two parallel tracks:

1. **One Brain** (Vault Sync) — Merge human knowledge (Obsidian vault) and AI-learned knowledge (LocalNest SQLite) into one connected graph. User opens Obsidian, sees their personal notes cross-linked with AI memories, KG entities, and agent activity.

2. **Lean Engine** (Token Optimization) — Consolidate 74 MCP tools into ~10 via STRAP pattern. Trim schema descriptions. Slim response envelopes. Fewer tokens per session, faster tool discovery, lower cost at scale.

## Core Principle

**Obsidian IS the hub.** No new UI to build. No new app to launch. LocalNest becomes a sync daemon that enriches the user's existing Obsidian vault with AI-learned knowledge, and feeds user edits back to the AI.

## Architecture

```
YOUR OBSIDIAN VAULT
├── Your personal notes, daily notes, projects
└── AI-Brain/                          ← synced by localnest
    ├── memories/{title}.md            ← one note per memory
    ├── entities/{name}.md             ← one note per KG entity
    ├── predicates/{name}.md           ← relationship type index
    ├── activity/{date}.md             ← daily agent activity
    └── 000 - Brain Index.md           ← MOC with stats

SYNC FLOW:
  SQLite ──triggers──► _sync_outbox ──daemon──► .md files in vault
  .md files ──@parcel/watcher──► daemon ──► SQLite
```

## What This Enables

1. **Graph view** — user's notes + AI memories + KG entities all in one graph
2. **Cross-linking** — user writes `[[Flutter]]` in their notes, it links to the AI's Flutter entity with 53 triples
3. **Manual memory creation** — user creates a note in AI-Brain/memories/, it becomes an AI-recallable memory
4. **Memory curation** — user edits/deletes AI memories directly in Obsidian
5. **Daily activity** — agent events auto-append to daily notes
6. **Search** — Obsidian's search covers both human and AI knowledge

## Non-Goals (v0.4.0)

- Obsidian plugin (not needed — pure filesystem sync)
- Mobile sync (Obsidian Sync handles that independently)
- Real-time collaboration (single user, single machine)
- CRDT (overkill for local-only single-writer-per-side)

## Technical Stack

| Component | Choice | Why |
|---|---|---|
| File watcher | `@parcel/watcher` | Snapshot/resume, C++ coalescing, used by VS Code |
| YAML frontmatter | `gray-matter` + regex surgery | Round-trip safe, no formatting loss |
| SQLite change detection | Trigger-based `_sync_outbox` | Survives restarts, captures exact row changes |
| Debounce | 4 seconds | Obsidian auto-saves every 2s |
| Conflict winner | Vault (user) always wins | User intent is sacred |

## Key Constraints

- Must not break existing MCP server (sync daemon is a separate process)
- Must not create `.obsidian` folder inside AI-Brain/ (causes Obsidian indexer stalls)
- Must handle daemon crashes gracefully (snapshot-based recovery via @parcel/watcher)
- Must work on Linux, macOS, and Windows
- Must not corrupt YAML frontmatter on round-trip (use regex surgery, not parse+stringify)

## Token Optimization Targets

| Metric | Current | Target | How |
|---|---|---|---|
| Registered MCP tools | 74 | ~10 | STRAP consolidation |
| Schema tokens (all tools) | ~22K | ~4K | Fewer tools + trimmed descriptions |
| ToolSearch round-trips | 3-5 per task | 1-2 per task | Fewer tools to discover |
| Response overhead | ~200 tokens/call | ~80 tokens/call | Conditional meta, flatter shapes |
| Human read operations via MCP | All of them | Zero | Obsidian vault sync replaces MCP for human reads |

## STRAP Pattern

Single Tool, Resource, Action, Parameters. Instead of 13 `kg_*` tools:

```
localnest_kg({ action: "query", entity_id: "flutter", direction: "outgoing" })
localnest_kg({ action: "add_triple", subject: "app", predicate: "uses", object: "flutter" })
localnest_kg({ action: "timeline", entity_id: "flutter" })
```

One schema loaded once. Same capabilities. ~80% fewer schema tokens for the KG domain alone.

### Backward Compatibility

- Old names kept as aliases in v0.4.0 with deprecation warning
- Removed in v0.5.0
- No breaking changes to response shapes
