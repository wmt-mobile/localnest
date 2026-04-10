import crypto from 'node:crypto';
import { nowIso, cleanString, stableJson } from '../utils.js';
import { ensureEntity } from './kg.js';
import type { Adapter, AddEntityInput, AddTripleInput } from '../types.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BatchError {
  index: number;
  message: string;
}

export interface BatchSummary {
  created: number;
  duplicates: number;
  errors: BatchError[];
  ids?: (string | null)[];
}

export interface AddEntityBatchInput {
  entities: AddEntityInput[];
  response_format?: 'minimal' | 'verbose';
}

export interface AddTripleBatchInput {
  triples: AddTripleInput[];
  response_format?: 'minimal' | 'verbose';
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class BatchSizeExceededError extends Error {
  code = 'MAX_BATCH_SIZE_EXCEEDED' as const;
  limit: number;
  received: number;

  constructor(limit: number, received: number) {
    super(`Batch size ${received} exceeds maximum of ${limit}`);
    this.name = 'BatchSizeExceededError';
    this.limit = limit;
    this.received = received;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MAX_BATCH_SIZE = 500;

function toSlug(name: string): string {
  return cleanString(name, 200)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

// ---------------------------------------------------------------------------
// addEntityBatch
// ---------------------------------------------------------------------------

export async function addEntityBatch(
  adapter: Adapter,
  input: AddEntityBatchInput
): Promise<BatchSummary> {
  const { entities, response_format } = input;

  if (entities.length > MAX_BATCH_SIZE) {
    throw new BatchSizeExceededError(MAX_BATCH_SIZE, entities.length);
  }

  const verbose = response_format === 'verbose';

  return adapter.transaction(async (ad) => {
    let created = 0;
    let duplicates = 0;
    const errors: BatchError[] = [];
    const ids: (string | null)[] = verbose ? [] : [];

    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      const cleanName = cleanString(entity.name, 400);

      if (!cleanName) {
        errors.push({ index: i, message: 'entity name is required' });
        if (verbose) ids.push(null);
        continue;
      }

      const id = toSlug(cleanName);
      if (!id) {
        errors.push({ index: i, message: 'entity name must produce a valid slug' });
        if (verbose) ids.push(null);
        continue;
      }

      const entityType = cleanString(entity.type, 100) || 'concept';
      const props = entity.properties || {};
      const memId = entity.memoryId || null;
      const now = nowIso();

      const result = await ad.run(
        `INSERT OR IGNORE INTO kg_entities (id, name, entity_type, properties_json, memory_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, cleanName, entityType, stableJson(props), memId, now, now]
      );

      const wasCreated = (result?.changes ?? 0) > 0;

      if (wasCreated) {
        created += 1;
      } else {
        duplicates += 1;
        // Touch updated_at for existing entities
        await ad.run(
          'UPDATE kg_entities SET updated_at = ? WHERE id = ?',
          [now, id]
        );
      }

      if (verbose) ids.push(id);
    }

    const summary: BatchSummary = { created, duplicates, errors };
    if (verbose) summary.ids = ids;
    return summary;
  });
}

// ---------------------------------------------------------------------------
// addTripleBatch
// ---------------------------------------------------------------------------

interface DupCheckRow {
  id: string;
}

export async function addTripleBatch(
  adapter: Adapter,
  input: AddTripleBatchInput
): Promise<BatchSummary> {
  const { triples, response_format } = input;

  if (triples.length > MAX_BATCH_SIZE) {
    throw new BatchSizeExceededError(MAX_BATCH_SIZE, triples.length);
  }

  const verbose = response_format === 'verbose';

  return adapter.transaction(async (ad) => {
    let created = 0;
    let duplicates = 0;
    const errors: BatchError[] = [];
    const ids: (string | null)[] = verbose ? [] : [];

    for (let i = 0; i < triples.length; i++) {
      const t = triples[i];

      // Validate predicate
      const pred = cleanString(t.predicate, 400);
      if (!pred) {
        errors.push({ index: i, message: 'predicate is required' });
        if (verbose) ids.push(null);
        continue;
      }

      // Validate subject
      let subId = cleanString(t.subjectId, 400);
      const subName = t.subjectName;
      if (!subId && !subName) {
        errors.push({ index: i, message: 'subject is required (provide subjectId or subjectName)' });
        if (verbose) ids.push(null);
        continue;
      }

      // Validate object
      let objId = cleanString(t.objectId, 400);
      const objName = t.objectName;
      if (!objId && !objName) {
        errors.push({ index: i, message: 'object is required (provide objectId or objectName)' });
        if (verbose) ids.push(null);
        continue;
      }

      // Resolve names to IDs
      if (!subId && subName) {
        subId = await ensureEntity(ad, subName);
      }
      if (!objId && objName) {
        objId = await ensureEntity(ad, objName);
      }

      // Dedup check: same (subject_id, predicate, object_id) where valid_to IS NULL
      const existing = await ad.get<DupCheckRow>(
        `SELECT id FROM kg_triples
          WHERE subject_id = ? AND predicate = ? AND object_id = ? AND valid_to IS NULL`,
        [subId, pred, objId]
      );

      if (existing) {
        duplicates += 1;
        if (verbose) ids.push(existing.id);
        continue;
      }

      // Prepare fields
      const id = `triple_${crypto.randomUUID()}`;
      const vFrom = t.validFrom === null ? null : (t.validFrom ?? nowIso());
      const vTo = t.validTo || null;
      let conf = t.confidence !== undefined && t.confidence !== null ? Number(t.confidence) : 1.0;
      if (!Number.isFinite(conf)) conf = 1.0;
      conf = Math.max(0.0, Math.min(1.0, conf));
      const srcMemId = t.sourceMemoryId || null;
      const srcType = cleanString(t.sourceType, 100) || 'manual';
      const now = nowIso();

      await ad.run(
        `INSERT INTO kg_triples (id, subject_id, predicate, object_id, valid_from, valid_to, confidence, source_memory_id, source_type, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, subId, pred, objId, vFrom, vTo, conf, srcMemId, srcType, now]
      );

      created += 1;
      if (verbose) ids.push(id);
    }

    const summary: BatchSummary = { created, duplicates, errors };
    if (verbose) summary.ids = ids;
    return summary;
  });
}
