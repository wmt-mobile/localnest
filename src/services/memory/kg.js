import crypto from 'node:crypto';
import { nowIso, cleanString, stableJson } from './utils.js';

function toSlug(name) {
  return cleanString(name, 200)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

export async function addEntity(adapter, { name, type, properties, memoryId } = {}) {
  const cleanName = cleanString(name, 400);
  if (!cleanName) throw new Error('entity name is required');

  const id = toSlug(cleanName);
  if (!id) throw new Error('entity name must produce a valid slug');

  const entityType = cleanString(type, 100) || 'concept';
  const props = properties || {};
  const memId = memoryId || null;
  const now = nowIso();

  const result = await adapter.run(
    `INSERT OR IGNORE INTO kg_entities (id, name, entity_type, properties_json, memory_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, cleanName, entityType, stableJson(props), memId, now, now]
  );

  const created = (result?.changes ?? 0) > 0;

  if (!created) {
    await adapter.run(
      'UPDATE kg_entities SET updated_at = ? WHERE id = ?',
      [now, id]
    );
  }

  return {
    id,
    name: cleanName,
    entity_type: entityType,
    properties_json: stableJson(props),
    memory_id: memId,
    created_at: now,
    updated_at: now,
    created
  };
}

export async function ensureEntity(adapter, name, type = 'concept') {
  const cleanName = cleanString(name, 400);
  if (!cleanName) throw new Error('entity name is required');

  const id = toSlug(cleanName);
  if (!id) throw new Error('entity name must produce a valid slug');

  const entityType = cleanString(type, 100) || 'concept';
  const now = nowIso();

  await adapter.run(
    `INSERT OR IGNORE INTO kg_entities (id, name, entity_type, properties_json, memory_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, cleanName, entityType, stableJson({}), null, now, now]
  );

  return id;
}

export async function getEntity(adapter, entityId) {
  const id = cleanString(entityId, 400);
  if (!id) throw new Error('entityId is required');

  const entity = await adapter.get('SELECT * FROM kg_entities WHERE id = ?', [id]);
  if (!entity) return null;

  const outgoing = await adapter.all(
    'SELECT * FROM kg_triples WHERE subject_id = ? AND valid_to IS NULL',
    [id]
  );

  const incoming = await adapter.all(
    'SELECT * FROM kg_triples WHERE object_id = ? AND valid_to IS NULL',
    [id]
  );

  return {
    ...entity,
    properties: JSON.parse(entity.properties_json || '{}'),
    outgoing,
    incoming
  };
}

export async function addTriple(adapter, {
  subjectId, subjectName,
  predicate,
  objectId, objectName,
  validFrom, validTo, confidence,
  sourceMemoryId, sourceType
} = {}) {
  let subId = cleanString(subjectId, 400);
  const pred = cleanString(predicate, 400);
  let objId = cleanString(objectId, 400);

  if (!subId && !subjectName) throw new Error('subject is required (provide subjectId or subjectName)');
  if (!pred) throw new Error('predicate is required');
  if (!objId && !objectName) throw new Error('object is required (provide objectId or objectName)');

  const id = `triple_${crypto.randomUUID()}`;
  const vFrom = validFrom || null;
  const vTo = validTo || null;
  let conf = confidence !== undefined && confidence !== null ? Number(confidence) : 1.0;
  if (!Number.isFinite(conf)) conf = 1.0;
  conf = Math.max(0.0, Math.min(1.0, conf));
  const srcMemId = sourceMemoryId || null;
  const srcType = cleanString(sourceType, 100) || 'manual';
  const now = nowIso();

  const result = await adapter.transaction(async (ad) => {
    if (!subId && subjectName) {
      subId = await ensureEntity(ad, subjectName);
    }
    if (!objId && objectName) {
      objId = await ensureEntity(ad, objectName);
    }

    await ad.run(
      `INSERT INTO kg_triples (id, subject_id, predicate, object_id, valid_from, valid_to, confidence, source_memory_id, source_type, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, subId, pred, objId, vFrom, vTo, conf, srcMemId, srcType, now]
    );

    return {
      id,
      subject_id: subId,
      predicate: pred,
      object_id: objId,
      valid_from: vFrom,
      valid_to: vTo,
      confidence: conf,
      source_memory_id: srcMemId,
      source_type: srcType,
      created_at: now
    };
  });

  return result;
}

export async function invalidateTriple(adapter, tripleId, validTo) {
  const id = cleanString(tripleId, 400);
  if (!id) throw new Error('tripleId is required');

  const vTo = validTo || nowIso();

  const result = await adapter.run(
    'UPDATE kg_triples SET valid_to = ? WHERE id = ? AND valid_to IS NULL',
    [vTo, id]
  );

  return {
    id,
    valid_to: vTo,
    invalidated: (result?.changes ?? 0) > 0
  };
}

export async function queryEntityRelationships(adapter, entityId, { direction, includeInvalid } = {}) {
  const id = cleanString(entityId, 400);
  if (!id) throw new Error('entityId is required');

  const dir = direction || 'both';
  const showInvalid = includeInvalid || false;
  const validClause = showInvalid ? '' : 'AND t.valid_to IS NULL';

  let results;

  if (dir === 'outgoing') {
    results = await adapter.all(
      `SELECT t.*, s.name AS subject_name, o.name AS object_name
         FROM kg_triples t
         JOIN kg_entities s ON s.id = t.subject_id
         JOIN kg_entities o ON o.id = t.object_id
        WHERE t.subject_id = ? ${validClause}
        ORDER BY t.created_at DESC`,
      [id]
    );
  } else if (dir === 'incoming') {
    results = await adapter.all(
      `SELECT t.*, s.name AS subject_name, o.name AS object_name
         FROM kg_triples t
         JOIN kg_entities s ON s.id = t.subject_id
         JOIN kg_entities o ON o.id = t.object_id
        WHERE t.object_id = ? ${validClause}
        ORDER BY t.created_at DESC`,
      [id]
    );
  } else {
    const outgoing = await adapter.all(
      `SELECT t.*, s.name AS subject_name, o.name AS object_name
         FROM kg_triples t
         JOIN kg_entities s ON s.id = t.subject_id
         JOIN kg_entities o ON o.id = t.object_id
        WHERE t.subject_id = ? ${validClause}
        ORDER BY t.created_at DESC`,
      [id]
    );
    const incoming = await adapter.all(
      `SELECT t.*, s.name AS subject_name, o.name AS object_name
         FROM kg_triples t
         JOIN kg_entities s ON s.id = t.subject_id
         JOIN kg_entities o ON o.id = t.object_id
        WHERE t.object_id = ? ${validClause}
        ORDER BY t.created_at DESC`,
      [id]
    );

    const seen = new Set();
    results = [];
    for (const row of [...outgoing, ...incoming]) {
      if (!seen.has(row.id)) {
        seen.add(row.id);
        results.push(row);
      }
    }
  }

  return {
    entity_id: id,
    direction: dir,
    count: results.length,
    triples: results
  };
}

export { toSlug as normalizeEntityId };
