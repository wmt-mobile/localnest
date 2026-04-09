---
name: localnest:ingest
description: Ingest a conversation file into memory and knowledge graph
argument-hint: "<file-path>"
allowed-tools:
  - Read
  - Bash
  - mcp__localnest__localnest_ingest_markdown
  - mcp__localnest__localnest_ingest_json
---

<objective>
Import a conversation export into LocalNest's memory system with automatic entity extraction and KG triple creation.
</objective>

<process>
1. Parse $ARGUMENTS for the file path.
2. Read the file content using the Read tool.
3. Detect format from extension (.md/.markdown → markdown, .json → json).
4. Call `localnest_ingest_markdown` or `localnest_ingest_json` with the file content.
5. Report results: turns parsed, entries created, entities extracted, triples created, duplicates skipped.
</process>
