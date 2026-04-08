---
title: Knowledge Graph
description: Temporal knowledge graph with entities, triples, traversal, and contradiction detection
sidebar_label: Knowledge Graph
sidebar_position: 5
---

# Knowledge Graph

LocalNest includes a temporal knowledge graph built on SQLite. Store structured facts as subject-predicate-object triples, query at any point in time, and walk relationships across multiple hops.

## Entities

Entities represent people, projects, concepts, or any named thing.

| Tool | What it does |
|------|-------------|
| `localnest_kg_add_entity` | Create entity with name, type, and properties. IDs are auto-generated as normalized slugs. |

Entity IDs are normalized slugs: `Alice O'Brien` becomes `alice_o_brien`. Entities are auto-created when first referenced in a triple.

## Triples

Triples connect a subject to an object via a predicate, with optional temporal validity.

| Tool | What it does |
|------|-------------|
| `localnest_kg_add_triple` | Add a fact: subject, predicate, object |
| `localnest_kg_query` | Query all relationships for an entity |
| `localnest_kg_invalidate` | Mark a fact as no longer valid |

:::tip[Contradiction Detection]
When you add a triple that conflicts with an existing valid triple (same subject + predicate, different object), LocalNest warns you. It never blocks the write.
:::

## Temporal Queries

Every triple has optional `valid_from` and `valid_to` dates.

| Tool | What it does |
|------|-------------|
| `localnest_kg_as_of` | What was true about entity X on date Y? |
| `localnest_kg_timeline` | Chronological evolution of all facts for an entity |
| `localnest_kg_stats` | Entity count, triple count, predicate breakdown |

## Graph Traversal

Walk relationships 2-5 hops deep using SQLite recursive CTEs. No other local-first tool offers this.

| Tool | What it does |
|------|-------------|
| `localnest_graph_traverse` | Multi-hop walk from a starting entity (default 2 hops, max 5) |
| `localnest_graph_bridges` | Find entities connected across different nests |

## CLI

```bash
localnest kg add Alice works_on ProjectX
localnest kg query Alice
localnest kg timeline Alice
localnest kg stats
```
