import { z } from 'zod';
import { MemoryHooks } from '../../services/memory/hooks.js';

export function registerGraphTools({
  registerJsonTool,
  memory
}) {
  // ─── KG Tools (localnest_kg_*) ──────────────────────────────────────

  registerJsonTool(
    ['localnest_kg_add_entity'],
    {
      title: 'KG Add Entity',
      description: 'Create or update an entity in the knowledge graph. Entity IDs are auto-generated as normalized slugs (lowercase, underscored).',
      inputSchema: {
        name: z.string().min(1).max(400),
        type: z.string().max(100).default('concept'),
        properties: z.record(z.string(), z.any()).default({}),
        memory_id: z.string().optional()
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async ({ name, type, properties, memory_id }) =>
      memory.addEntity({ name, type, properties, memoryId: memory_id })
  );

  registerJsonTool(
    ['localnest_kg_add_triple'],
    {
      title: 'KG Add Triple',
      description: 'Add a subject-predicate-object triple to the knowledge graph. Entities are auto-created on first reference. Detects contradictions (same subject+predicate with different valid object) and warns without blocking.',
      inputSchema: {
        subject_name: z.string().min(1).max(400),
        predicate: z.string().min(1).max(400),
        object_name: z.string().min(1).max(400),
        subject_id: z.string().max(400).optional(),
        object_id: z.string().max(400).optional(),
        valid_from: z.string().optional(),
        valid_to: z.string().optional(),
        confidence: z.number().min(0).max(1).default(1.0),
        source_memory_id: z.string().optional(),
        source_type: z.string().max(100).default('manual')
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false
      }
    },
    async ({ subject_name, predicate, object_name, subject_id, object_id, valid_from, valid_to, confidence, source_memory_id, source_type }) =>
      memory.addTriple({
        subjectName: subject_name,
        subjectId: subject_id,
        predicate,
        objectName: object_name,
        objectId: object_id,
        validFrom: valid_from,
        validTo: valid_to,
        confidence,
        sourceMemoryId: source_memory_id,
        sourceType: source_type
      })
  );

  registerJsonTool(
    ['localnest_kg_query'],
    {
      title: 'KG Query Entity',
      description: 'Query all relationships for an entity in the knowledge graph with optional direction filtering (outgoing, incoming, or both).',
      inputSchema: {
        entity_id: z.string().min(1).max(400),
        direction: z.enum(['outgoing', 'incoming', 'both']).default('both'),
        include_invalid: z.boolean().default(false)
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async ({ entity_id, direction, include_invalid }) =>
      memory.queryEntityRelationships(entity_id, { direction, includeInvalid: include_invalid })
  );

  registerJsonTool(
    ['localnest_kg_invalidate'],
    {
      title: 'KG Invalidate Triple',
      description: 'Set valid_to on a triple to mark it as no longer current. The triple remains in history but is excluded from current-state queries.',
      inputSchema: {
        triple_id: z.string().min(1),
        valid_to: z.string().optional()
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async ({ triple_id, valid_to }) =>
      memory.invalidateTriple(triple_id, valid_to)
  );

  registerJsonTool(
    ['localnest_kg_as_of'],
    {
      title: 'KG As-Of Query',
      description: 'Query triples for an entity at a specific point in time. Returns only facts valid at the given date (valid_from <= date, valid_to > date or NULL).',
      inputSchema: {
        entity_id: z.string().min(1).max(400),
        as_of_date: z.string().min(1)
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async ({ entity_id, as_of_date }) =>
      memory.queryTriplesAsOf(entity_id, as_of_date)
  );

  registerJsonTool(
    ['localnest_kg_timeline'],
    {
      title: 'KG Entity Timeline',
      description: 'Get a chronological timeline of all triples for an entity, including invalidated facts. Ordered by valid_from date ascending.',
      inputSchema: {
        entity_id: z.string().min(1).max(400)
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async ({ entity_id }) =>
      memory.getEntityTimeline(entity_id)
  );

  registerJsonTool(
    ['localnest_kg_stats'],
    {
      title: 'KG Statistics',
      description: 'Get knowledge graph statistics: total entity count, total triple count, active triple count, and breakdown by predicate type.',
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async () => memory.getKgStats()
  );

  // ─── Nest/Branch Tools (localnest_nest_*) ───────────────────────────

  registerJsonTool(
    ['localnest_nest_list'],
    {
      title: 'Nest List',
      description: 'List all nests (top-level memory domains) with their memory entry counts.',
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async () => memory.listNests()
  );

  registerJsonTool(
    ['localnest_nest_branches'],
    {
      title: 'Nest Branches',
      description: 'List all branches (topics) within a specific nest with their memory entry counts.',
      inputSchema: {
        nest: z.string().min(1).max(200)
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async ({ nest }) => memory.listBranches(nest)
  );

  registerJsonTool(
    ['localnest_nest_tree'],
    {
      title: 'Nest Taxonomy Tree',
      description: 'Get the full taxonomy tree: all nests, their branches, and memory counts at each level.',
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async () => memory.getTaxonomyTree()
  );

  // ─── Graph Traversal Tools (localnest_graph_*) ──────────────────────

  registerJsonTool(
    ['localnest_graph_traverse'],
    {
      title: 'Graph Traverse',
      description: 'Traverse the knowledge graph from a starting entity with configurable max hops (default 2). Uses recursive CTEs with cycle prevention. Returns discovered entities with path information.',
      inputSchema: {
        start_entity_id: z.string().min(1).max(400),
        max_hops: z.number().int().min(1).max(5).default(2),
        direction: z.enum(['outgoing', 'incoming', 'both']).default('both')
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async ({ start_entity_id, max_hops, direction }) =>
      memory.traverseGraph({ startEntityId: start_entity_id, maxHops: max_hops, direction })
  );

  registerJsonTool(
    ['localnest_graph_bridges'],
    {
      title: 'Graph Bridges',
      description: 'Discover cross-nest bridges: entities connected by triples that span different nests. Optionally filter to bridges involving a specific nest.',
      inputSchema: {
        nest: z.string().max(200).optional()
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async ({ nest }) => memory.discoverBridges({ nest })
  );

  // ─── Diary Tools (localnest_diary_*) ────────────────────────────────

  registerJsonTool(
    ['localnest_diary_write'],
    {
      title: 'Diary Write',
      description: 'Write a private diary entry for an agent. Diary entries are isolated and only visible to the owning agent.',
      inputSchema: {
        agent_id: z.string().min(1).max(200),
        content: z.string().min(1).max(20000),
        topic: z.string().max(200).optional()
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false
      }
    },
    async ({ agent_id, content, topic }) =>
      memory.writeDiaryEntry({ agentId: agent_id, content, topic })
  );

  registerJsonTool(
    ['localnest_diary_read'],
    {
      title: 'Diary Read',
      description: 'Read recent diary entries for a specific agent. Only returns entries belonging to the requesting agent.',
      inputSchema: {
        agent_id: z.string().min(1).max(200),
        topic: z.string().max(200).optional(),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0)
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async ({ agent_id, topic, limit, offset }) =>
      memory.readDiaryEntries({ agentId: agent_id, topic, limit, offset })
  );

  // ─── Ingest Tools (localnest_ingest_*) ──────────────────────────────

  registerJsonTool(
    ['localnest_ingest_markdown'],
    {
      title: 'Ingest Markdown Conversation',
      description: 'Ingest a Markdown conversation export into memory entries and knowledge graph triples. Pass the full text content directly — file reading is handled by the CLI, not MCP tools.',
      inputSchema: {
        content: z.string().min(1).max(500000).describe('Full markdown text content to ingest'),
        source_label: z.string().max(1000).optional().describe('Optional label for re-ingestion tracking (e.g. filename)'),
        nest: z.string().max(200).default(''),
        branch: z.string().max(200).default(''),
        agent_id: z.string().max(200).default('')
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async ({ content, source_label, nest, branch, agent_id }) =>
      memory.ingestMarkdown({ content, filePath: source_label || '', nest, branch, agentId: agent_id })
  );

  registerJsonTool(
    ['localnest_ingest_json'],
    {
      title: 'Ingest JSON Conversation',
      description: 'Ingest a JSON conversation export (array of {role, content, timestamp?} objects) into memory entries and knowledge graph triples. Pass the full JSON text directly.',
      inputSchema: {
        content: z.string().min(1).max(500000).describe('Full JSON text content to ingest'),
        source_label: z.string().max(1000).optional().describe('Optional label for re-ingestion tracking'),
        nest: z.string().max(200).default(''),
        branch: z.string().max(200).default(''),
        agent_id: z.string().max(200).default('')
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async ({ content, source_label, nest, branch, agent_id }) =>
      memory.ingestJson({ content, filePath: source_label || '', nest, branch, agentId: agent_id })
  );

  // ─── Dedup Tool (localnest_memory_check_duplicate) ──────────────────

  registerJsonTool(
    ['localnest_memory_check_duplicate'],
    {
      title: 'Memory Check Duplicate',
      description: 'Check whether content is a semantic duplicate of an existing memory entry. Uses embedding cosine similarity with configurable threshold (default 0.92). Returns the matching entry when a duplicate is found.',
      inputSchema: {
        content: z.string().min(1).max(20000),
        threshold: z.number().min(0).max(1).default(0.92),
        nest: z.string().max(200).optional(),
        branch: z.string().max(200).optional(),
        project_path: z.string().max(1000).optional()
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async ({ content, threshold, nest, branch, project_path }) =>
      memory.checkDuplicate(content, { threshold, nest, branch, projectPath: project_path })
  );

  // ─── Hook Introspection Tools (localnest_hooks_*) ────────────────────

  registerJsonTool(
    ['localnest_hooks_stats'],
    {
      title: 'Hooks Stats',
      description: 'Returns hook system statistics: whether hooks are enabled, total registered listener count, and a breakdown of listener counts per event type.',
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async () => memory.store.hooks.getStats()
  );

  registerJsonTool(
    ['localnest_hooks_list_events'],
    {
      title: 'Hooks List Events',
      description: 'Returns all valid hook event names that listeners can subscribe to. Covers memory lifecycle (store, update, delete, recall), knowledge graph operations (addEntity, addTriple, invalidate), graph traversal, diary, ingestion, dedup, taxonomy, and catch-all wildcards.',
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async () => ({ events: MemoryHooks.validEvents() })
  );
}
