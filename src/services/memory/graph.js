import { cleanString, clampInt } from './utils.js';

/**
 * Traverse the knowledge graph from a starting entity using recursive CTEs.
 * Discovers connected entities up to N hops away with cycle prevention.
 *
 * @param {object} adapter - NodeSqliteAdapter instance
 * @param {object} opts
 * @param {string} opts.startEntityId - Entity slug to start from (required)
 * @param {number} [opts.maxHops=2] - Max traversal depth, clamped 1-5
 * @param {string} [opts.direction='both'] - 'outgoing', 'incoming', or 'both'
 * @returns {Promise<object>} Traversal results with discovered entities
 */
export async function traverseGraph(adapter, { startEntityId, maxHops, direction } = {}) {
  const start = cleanString(startEntityId, 400);
  if (!start) throw new Error('startEntityId is required');

  const hops = clampInt(maxHops, 2, 1, 5);
  const dir = ['outgoing', 'incoming', 'both'].includes(direction) ? direction : 'both';

  let sql;
  const params = [start, start, hops, start];

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
          AND (',' || r.path || ',') NOT LIKE ('%,' || t.object_id || ',%')
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
          AND (',' || r.path || ',') NOT LIKE ('%,' || t.subject_id || ',%')
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
          AND r.path NOT LIKE '%' || CASE WHEN t.subject_id = r.entity_id THEN t.object_id ELSE t.subject_id END || '%'
      )
      SELECT DISTINCT r.entity_id, r.depth, r.path,
             e.name, e.entity_type
      FROM reachable r
      JOIN kg_entities e ON e.id = r.entity_id
      WHERE r.entity_id != ?
      ORDER BY r.depth ASC, e.name ASC`;
  }

  const rows = await adapter.all(sql, params);

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

/**
 * Discover entities that bridge across different nests.
 * Finds triples where the subject's nest differs from the object's nest.
 *
 * @param {object} adapter - NodeSqliteAdapter instance
 * @param {object} [opts]
 * @param {string} [opts.nest] - Optional nest filter
 * @returns {Promise<object>} Bridge triples crossing nest boundaries
 */
export async function discoverBridges(adapter, { nest } = {}) {
  const cleanNest = nest ? cleanString(nest, 200) : null;

  let sql = `
    SELECT DISTINCT
      t.id AS triple_id,
      t.subject_id,
      s.name AS subject_name,
      t.predicate,
      t.object_id,
      o.name AS object_name,
      ms.nest AS subject_nest,
      mo.nest AS object_nest
    FROM kg_triples t
    JOIN kg_entities s ON s.id = t.subject_id
    JOIN kg_entities o ON o.id = t.object_id
    JOIN memory_entries ms ON ms.id = s.memory_id
    JOIN memory_entries mo ON mo.id = o.memory_id
    WHERE t.valid_to IS NULL
      AND ms.nest != ''
      AND mo.nest != ''
      AND ms.nest != mo.nest`;

  const params = [];

  if (cleanNest) {
    sql += `\n      AND (ms.nest = ? OR mo.nest = ?)`;
    params.push(cleanNest, cleanNest);
  }

  sql += `\n    ORDER BY ms.nest, mo.nest, s.name`;

  const rows = await adapter.all(sql, params);

  return {
    filter_nest: cleanNest,
    bridge_count: rows.length,
    bridges: rows.map(row => ({
      triple_id: row.triple_id,
      subject_id: row.subject_id,
      subject_name: row.subject_name,
      predicate: row.predicate,
      object_id: row.object_id,
      object_name: row.object_name,
      subject_nest: row.subject_nest,
      object_nest: row.object_nest
    }))
  };
}
