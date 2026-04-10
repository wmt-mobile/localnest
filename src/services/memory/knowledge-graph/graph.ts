import { cleanString, clampInt } from '../utils.js';
import type { Adapter, TraverseGraphOpts, TraverseGraphResult, DiscoverBridgesOpts, DiscoverBridgesResult, BridgeEntry } from '../types.js';

interface TraversalRow {
  entity_id: string;
  depth: number;
  path: string;
  name: string;
  entity_type: string;
}

interface BridgeRow {
  triple_id: string;
  subject_id: string;
  subject_name: string;
  predicate: string;
  object_id: string;
  object_name: string;
  subject_nest: string;
  object_nest: string;
  subject_type: string;
  object_type: string;
}

export async function traverseGraph(
  adapter: Adapter,
  { startEntityId, maxHops, direction }: TraverseGraphOpts
): Promise<TraverseGraphResult> {
  const start = cleanString(startEntityId, 400);
  if (!start) throw new Error('startEntityId is required');

  const hops = clampInt(maxHops, 2, 1, 5);
  const dir = (['outgoing', 'incoming', 'both'] as const).includes(direction as 'outgoing' | 'incoming' | 'both') ? direction! : 'both';

  let sql: string;
  const params: unknown[] = [start, start, hops, start];

  if (dir === 'outgoing') {
    sql = `
      WITH RECURSIVE reachable(entity_id, depth, path) AS (
        SELECT ?, 0, ?
        UNION ALL
        SELECT
          t.object_id,
          r.depth + 1,
          r.path || ',' || t.object_id
        FROM kg_triples t
        JOIN reachable r ON t.subject_id = r.entity_id
        WHERE r.depth < ?
          AND t.valid_to IS NULL
          AND INSTR(',' || r.path || ',', ',' || t.object_id || ',') = 0
      )
      SELECT DISTINCT r.entity_id, r.depth, r.path,
             e.name, e.entity_type
      FROM reachable r
      JOIN kg_entities e ON e.id = r.entity_id
      WHERE r.entity_id != ?
      ORDER BY r.depth ASC, e.name ASC`;
  } else if (dir === 'incoming') {
    sql = `
      WITH RECURSIVE reachable(entity_id, depth, path) AS (
        SELECT ?, 0, ?
        UNION ALL
        SELECT
          t.subject_id,
          r.depth + 1,
          r.path || ',' || t.subject_id
        FROM kg_triples t
        JOIN reachable r ON t.object_id = r.entity_id
        WHERE r.depth < ?
          AND t.valid_to IS NULL
          AND INSTR(',' || r.path || ',', ',' || t.subject_id || ',') = 0
      )
      SELECT DISTINCT r.entity_id, r.depth, r.path,
             e.name, e.entity_type
      FROM reachable r
      JOIN kg_entities e ON e.id = r.entity_id
      WHERE r.entity_id != ?
      ORDER BY r.depth ASC, e.name ASC`;
  } else {
    sql = `
      WITH RECURSIVE reachable(entity_id, depth, path) AS (
        SELECT ?, 0, ?
        UNION ALL
        SELECT
          CASE WHEN t.subject_id = r.entity_id THEN t.object_id ELSE t.subject_id END,
          r.depth + 1,
          r.path || ',' || CASE WHEN t.subject_id = r.entity_id THEN t.object_id ELSE t.subject_id END
        FROM kg_triples t
        JOIN reachable r ON (t.subject_id = r.entity_id OR t.object_id = r.entity_id)
        WHERE r.depth < ?
          AND t.valid_to IS NULL
          AND INSTR(
            ',' || r.path || ',',
            ',' || CASE WHEN t.subject_id = r.entity_id THEN t.object_id ELSE t.subject_id END || ','
          ) = 0
      )
      SELECT DISTINCT r.entity_id, r.depth, r.path,
             e.name, e.entity_type
      FROM reachable r
      JOIN kg_entities e ON e.id = r.entity_id
      WHERE r.entity_id != ?
      ORDER BY r.depth ASC, e.name ASC`;
  }

  const rows = await adapter.all<TraversalRow>(sql, params);

  return {
    start_entity_id: start,
    max_hops: hops,
    direction: dir,
    discovered_count: rows.length,
    entities: rows.map(row => ({
      entity_id: row.entity_id,
      name: row.name,
      entity_type: row.entity_type,
      depth: row.depth,
      path: row.path.split(',').filter(Boolean)
    }))
  };
}

export async function discoverBridges(adapter: Adapter, { nest }: DiscoverBridgesOpts = {}): Promise<DiscoverBridgesResult> {
  const cleanNest = nest ? cleanString(nest, 200) : null;

  // Use LEFT JOINs so entities with NULL memory_id still participate.
  // Derive nest via COALESCE: entity's own memory_id -> triple's source_memory_id.
  let sql = `
    SELECT * FROM (
      SELECT DISTINCT
        t.id AS triple_id,
        t.subject_id,
        s.name AS subject_name,
        s.entity_type AS subject_type,
        t.predicate,
        t.object_id,
        o.name AS object_name,
        o.entity_type AS object_type,
        COALESCE(NULLIF(ms1.nest,''), NULLIF(mt.nest,'')) AS subject_nest,
        COALESCE(NULLIF(mo1.nest,''), NULLIF(mt.nest,'')) AS object_nest
      FROM kg_triples t
      JOIN kg_entities s ON s.id = t.subject_id
      JOIN kg_entities o ON o.id = t.object_id
      LEFT JOIN memory_entries ms1 ON ms1.id = s.memory_id
      LEFT JOIN memory_entries mo1 ON mo1.id = o.memory_id
      LEFT JOIN memory_entries mt  ON mt.id  = t.source_memory_id
      WHERE t.valid_to IS NULL
    ) AS bridges
    WHERE subject_nest != '' AND subject_nest IS NOT NULL
      AND object_nest  != '' AND object_nest  IS NOT NULL
      AND subject_nest != object_nest`;

  const params: unknown[] = [];

  if (cleanNest) {
    sql += `\n      AND (subject_nest = ? OR object_nest = ?)`;
    params.push(cleanNest, cleanNest);
  }

  sql += `\n    ORDER BY subject_nest, object_nest, subject_name`;

  const rows = await adapter.all<BridgeRow>(sql, params);

  // --- Build insights from entity -> nests mapping ---
  // Each entity in a bridge row is connected to both nests of that bridge.
  const entityNests = new Map<string, { name: string; type: string; nests: Set<string>; predicates: Set<string> }>();

  for (const row of rows) {
    const bothNests = [row.subject_nest, row.object_nest];
    for (const [id, name, type] of [
      [row.subject_id, row.subject_name, row.subject_type],
      [row.object_id, row.object_name, row.object_type]
    ] as [string, string, string][]) {
      let entry = entityNests.get(id);
      if (!entry) {
        entry = { name, type, nests: new Set(), predicates: new Set() };
        entityNests.set(id, entry);
      }
      for (const n of bothNests) entry.nests.add(n);
      entry.predicates.add(row.predicate);
    }
  }

  const insights: string[] = [];
  for (const [, info] of entityNests) {
    if (info.nests.size >= 2) {
      const nestList = [...info.nests].sort().join(', ');
      const predList = [...info.predicates].sort().join(', ');
      insights.push(`'${info.name}' (${info.type}) bridges ${nestList} via '${predList}'`);
    }
  }

  // --- Summary ---
  const nestPairs = new Set<string>();
  for (const row of rows) {
    const pair = [row.subject_nest, row.object_nest].sort().join('<->');
    nestPairs.add(pair);
  }
  const sharedCount = [...entityNests.values()].filter(e => e.nests.size >= 2).length;
  const summary = rows.length === 0
    ? 'No cross-nest bridges found'
    : `Found ${rows.length} bridge(s) across ${nestPairs.size} nest pair(s) involving ${sharedCount} shared entity/entities`;

  return {
    filter_nest: cleanNest,
    bridge_count: rows.length,
    bridges: rows.map((row): BridgeEntry => ({
      triple_id: row.triple_id,
      subject_id: row.subject_id,
      subject_name: row.subject_name,
      predicate: row.predicate,
      object_id: row.object_id,
      object_name: row.object_name,
      subject_nest: row.subject_nest,
      object_nest: row.object_nest,
      subject_type: row.subject_type,
      object_type: row.object_type
    })),
    insights,
    summary
  };
}
