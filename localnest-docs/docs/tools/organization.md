---
title: Nest/Branch and Agents
description: Two-level memory hierarchy and per-agent isolation with private diary
sidebar_label: Nest/Branch & Agents
sidebar_position: 6
---

# Nest/Branch Organization and Agent Isolation

## Nest/Branch Hierarchy

Organize memories into a two-level taxonomy. **Nests** are top-level domains (projects, people, topics). **Branches** are subtopics within nests (auth, billing, deployment).

| Tool | What it does |
|------|-------------|
| `localnest_nest_list` | List all nests with memory counts |
| `localnest_nest_branches` | List branches within a specific nest |
| `localnest_nest_tree` | Full taxonomy tree: nests, branches, counts |

Pass `nest` and `branch` parameters when storing memories for organized retrieval. Use them as filters on `localnest_memory_recall` for focused results.

## Agent Isolation

Multiple AI agents can share the same LocalNest instance without seeing each other's private data.

- **agent_id** on memory entries enables per-agent scoping
- **Recall** shows own memories + global memories, never another agent's private entries
- **Diary** is a separate private scratchpad per agent

| Tool | What it does |
|------|-------------|
| `localnest_diary_write` | Write a private diary entry (agent-isolated) |
| `localnest_diary_read` | Read your own recent diary entries |

## Conversation Ingestion

Import past conversations into structured memory with automatic entity extraction.

| Tool | What it does |
|------|-------------|
| `localnest_ingest_markdown` | Import Markdown conversation exports |
| `localnest_ingest_json` | Import JSON conversation exports |
| `localnest_memory_check_duplicate` | Check for semantic duplicates before filing |

Ingestion splits conversations into per-turn memory entries, extracts entities via rule-based heuristics, creates KG triples, and runs dedup. Re-ingestion of the same file is skipped by content hash.

## CLI

```bash
localnest ingest ./chat-export.md --nest conversations --branch project-x
localnest ingest ./export.json --format json
```
