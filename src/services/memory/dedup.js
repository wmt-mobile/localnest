import { cosineSimilarity } from '../retrieval/core/relevance.js';

const DEFAULT_THRESHOLD = 0.92;
const MAX_CANDIDATES = 200;

/**
 * Check whether incoming content is a semantic duplicate of an existing memory entry.
 *
 * @param {object} adapter - Database adapter with .all() method
 * @param {object} embeddingService - EmbeddingService instance with .embed()
 * @param {string} content - The text to check for duplicates
 * @param {object} [opts]
 * @param {number} [opts.threshold=0.92] - Cosine similarity threshold (0-1)
 * @param {string} [opts.nest] - Filter candidates to this nest
 * @param {string} [opts.branch] - Filter candidates to this branch
 * @param {string} [opts.projectPath] - Filter candidates to this project path
 * @returns {Promise<{isDuplicate: boolean, match?: {id: string, title: string, similarity: number}}>}
 */
export async function checkDuplicate(adapter, embeddingService, content, opts = {}) {
  if (!content || typeof content !== 'string' || !content.trim()) {
    return { isDuplicate: false };
  }

  if (!embeddingService?.isEnabled?.() || !embeddingService?.embed) {
    return { isDuplicate: false };
  }

  let queryEmbedding;
  try {
    queryEmbedding = await embeddingService.embed(content);
  } catch {
    return { isDuplicate: false };
  }

  if (!Array.isArray(queryEmbedding) || queryEmbedding.length === 0) {
    return { isDuplicate: false };
  }

  const threshold = typeof opts.threshold === 'number' && Number.isFinite(opts.threshold)
    ? Math.max(0, Math.min(1, opts.threshold))
    : DEFAULT_THRESHOLD;

  const filters = [`embedding_json IS NOT NULL`, `embedding_json != ''`, `status = 'active'`];
  const params = [];

  if (opts.nest) {
    filters.push('nest = ?');
    params.push(opts.nest);
  }
  if (opts.branch) {
    filters.push('branch = ?');
    params.push(opts.branch);
  }
  if (opts.projectPath) {
    filters.push('scope_project_path = ?');
    params.push(opts.projectPath);
  }

  const where = filters.join(' AND ');
  const rows = await adapter.all(
    `SELECT id, title, embedding_json FROM memory_entries
     WHERE ${where}
     ORDER BY updated_at DESC
     LIMIT ?`,
    [...params, MAX_CANDIDATES]
  );

  if (!rows || rows.length === 0) {
    return { isDuplicate: false };
  }

  let bestMatch = null;
  let bestSimilarity = -1;

  for (const row of rows) {
    let stored;
    try {
      stored = JSON.parse(row.embedding_json);
    } catch {
      continue;
    }
    if (!Array.isArray(stored) || stored.length === 0) continue;

    const similarity = cosineSimilarity(queryEmbedding, stored);
    if (similarity >= threshold && similarity > bestSimilarity) {
      bestSimilarity = similarity;
      bestMatch = { id: row.id, title: row.title, similarity: Number(similarity.toFixed(4)) };
    }
  }

  if (bestMatch) {
    return { isDuplicate: true, match: bestMatch };
  }

  return { isDuplicate: false };
}
