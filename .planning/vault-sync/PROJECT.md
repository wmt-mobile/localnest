# LocalNest Vault Sync — v0.4.0

**Codename:** One Brain
**Branch:** `feature/vault-sync`
**Status:** Planning

## Vision

Merge human knowledge (Obsidian vault) and AI-learned knowledge (LocalNest SQLite) into one connected graph. User opens Obsidian, sees their personal notes cross-linked with AI memories, KG entities, and agent activity — all in one brain.

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
