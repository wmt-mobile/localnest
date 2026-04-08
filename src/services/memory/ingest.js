import crypto from 'node:crypto';
import fs from 'node:fs';
import { nowIso, cleanString } from './utils.js';
import { storeEntry } from './entries.js';
import { addTriple } from './kg.js';
import { checkDuplicate } from './dedup.js';

/**
 * Compute SHA-256 hash of a string.
 */
function sha256(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

/**
 * Check if a file has already been ingested (same path + hash).
 */
export async function checkAlreadyIngested(adapter, filePath, fileHash) {
  const row = await adapter.get(
    'SELECT id, ingested_at, turn_count FROM conversation_sources WHERE file_path = ? AND file_hash = ?',
    [filePath, fileHash]
  );
  return row || null;
}

/**
 * Record an ingested source file.
 */
async function recordSource(adapter, { filePath, fileHash, turnCount, memoryIds }) {
  const id = `src_${crypto.randomUUID()}`;
  const now = nowIso();
  await adapter.run(
    `INSERT OR IGNORE INTO conversation_sources (id, file_path, file_hash, turn_count, memory_ids_json, ingested_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, filePath, fileHash, turnCount, JSON.stringify(memoryIds), now]
  );
  return { id, ingested_at: now };
}

// --- Markdown parsing ---

const ROLE_PATTERNS = [
  /^##\s+(user|assistant|system|human|ai)\s*$/i,
  /^\*\*(user|assistant|system|human|ai)\s*:\*\*/i,
  /^(user|assistant|system|human|ai)\s*:\s*/i
];

function normalizeRole(raw) {
  const lower = raw.toLowerCase().trim();
  if (lower === 'human') return 'user';
  if (lower === 'ai') return 'assistant';
  return lower;
}

/**
 * Parse a Markdown conversation into turns.
 * Supports: ## Role, **Role:**, Role: prefixes.
 * Returns [{role, content, index}].
 */
export function parseMarkdownConversation(text) {
  if (!text || typeof text !== 'string') return [];
  const lines = text.split('\n');
  const turns = [];
  let currentRole = null;
  let currentLines = [];

  for (const line of lines) {
    let matched = false;
    for (const pattern of ROLE_PATTERNS) {
      const match = line.match(pattern);
      if (match) {
        if (currentRole && currentLines.length > 0) {
          const content = currentLines.join('\n').trim();
          if (content) {
            turns.push({ role: normalizeRole(currentRole), content, index: turns.length });
          }
        }
        currentRole = match[1];
        currentLines = [];
        // For inline content after "Role: text", capture remainder
        const remainder = line.replace(pattern, '').trim();
        if (remainder) currentLines.push(remainder);
        matched = true;
        break;
      }
    }
    if (!matched && currentRole) {
      currentLines.push(line);
    }
  }

  // Flush last turn
  if (currentRole && currentLines.length > 0) {
    const content = currentLines.join('\n').trim();
    if (content) {
      turns.push({ role: normalizeRole(currentRole), content, index: turns.length });
    }
  }

  return turns;
}

// --- JSON parsing ---

/**
 * Parse a JSON conversation (array of {role, content, timestamp?}).
 * Returns [{role, content, timestamp, index}].
 */
export function parseJsonConversation(data) {
  if (!data) return [];
  let arr = data;
  if (typeof data === 'string') {
    try {
      arr = JSON.parse(data);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(arr)) return [];

  const turns = [];
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    if (!item || typeof item !== 'object') continue;
    const role = cleanString(item.role, 50);
    const content = cleanString(item.content, 50000);
    if (!role || !content) continue;
    turns.push({
      role: normalizeRole(role),
      content,
      timestamp: item.timestamp || null,
      index: turns.length
    });
  }
  return turns;
}

// --- Entity extraction (rule-based heuristics) ---

// Patterns for extracting named entities from text
const ENTITY_PATTERNS = [
  // Capitalized multi-word noun phrases (2-4 words): "Machine Learning", "Knowledge Graph Core"
  { regex: /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\b/g, type: 'concept' },
  // Quoted terms as entities: "knowledge graph", 'entity extraction'
  { regex: /["']([A-Za-z][A-Za-z0-9\s_-]{2,40})["']/g, type: 'concept' },
  // File paths: /src/foo.js, ./bar/baz.ts
  { regex: /(?:^|\s)((?:\.?\/?)?(?:[\w.-]+\/)+[\w.-]+\.[a-z]{1,5})\b/g, type: 'file' },
  // URLs
  { regex: /(https?:\/\/[^\s)<>"']+)/g, type: 'url' },
  // ALL_CAPS identifiers (likely constants or acronyms, 2-20 chars)
  { regex: /\b([A-Z][A-Z0-9_]{2,19})\b/g, type: 'concept' }
];

// Common English words to skip as entities
const STOP_WORDS = new Set([
  'the', 'this', 'that', 'these', 'those', 'with', 'from', 'into', 'have',
  'been', 'were', 'will', 'would', 'could', 'should', 'does', 'did', 'has',
  'each', 'every', 'some', 'many', 'much', 'more', 'most', 'other', 'another',
  'both', 'here', 'there', 'when', 'where', 'what', 'which', 'while', 'after',
  'before', 'above', 'below', 'between', 'through', 'during', 'about', 'against',
  'also', 'just', 'only', 'very', 'then', 'than', 'such', 'like', 'over',
  'however', 'therefore', 'because', 'since', 'until', 'although', 'though',
  'still', 'even', 'well', 'back', 'make', 'made', 'take', 'took', 'give',
  'gave', 'come', 'came', 'want', 'need', 'know', 'knew', 'think', 'thought',
  'look', 'find', 'found', 'tell', 'told', 'ask', 'asked', 'work', 'worked',
  'call', 'called', 'try', 'tried', 'keep', 'kept', 'let', 'begin', 'began',
  'seem', 'seemed', 'help', 'helped', 'show', 'showed', 'hear', 'heard',
  'play', 'played', 'run', 'ran', 'move', 'moved', 'live', 'lived',
  'NOT', 'AND', 'THE', 'FOR', 'BUT', 'NOR', 'YET', 'NULL', 'TRUE', 'FALSE',
  'TODO', 'NOTE', 'SEE'
]);

/**
 * Extract entities from text using regex heuristics.
 * Returns [{name, type}] with deduplication.
 */
export function extractEntities(text) {
  if (!text || typeof text !== 'string') return [];
  const seen = new Set();
  const entities = [];

  for (const { regex, type } of ENTITY_PATTERNS) {
    // Reset regex lastIndex for re-use
    regex.lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const raw = (match[1] || match[0]).trim();
      if (raw.length < 2 || raw.length > 100) continue;
      const normalized = raw.toLowerCase().replace(/\s+/g, ' ');
      if (STOP_WORDS.has(normalized) || STOP_WORDS.has(raw)) continue;
      if (seen.has(normalized)) continue;
      seen.add(normalized);
      entities.push({ name: raw, type });
    }
  }

  return entities.slice(0, 50);
}

/**
 * Generate KG triples from extracted entities within a conversation turn.
 * Creates "mentioned_in" relationships between entities and the source turn.
 * Creates "co_occurs_with" between entities mentioned in the same turn.
 */
function buildTriples(entities, turnRole, sourceMemoryId) {
  const triples = [];

  // Each entity "mentioned_in" conversation by role
  for (const entity of entities) {
    triples.push({
      subjectName: entity.name,
      predicate: 'mentioned_by',
      objectName: turnRole,
      sourceMemoryId,
      sourceType: 'conversation_ingestion',
      confidence: 0.7
    });
  }

  // Co-occurrence: pairs of entities in same turn
  for (let i = 0; i < entities.length && i < 10; i++) {
    for (let j = i + 1; j < entities.length && j < 10; j++) {
      triples.push({
        subjectName: entities[i].name,
        predicate: 'co_occurs_with',
        objectName: entities[j].name,
        sourceMemoryId,
        sourceType: 'conversation_ingestion',
        confidence: 0.5
      });
    }
  }

  return triples;
}

// --- Main ingestion pipelines ---

/**
 * Ingest a Markdown conversation into memory entries and KG triples.
 *
 * @param {object} adapter - Database adapter
 * @param {object} embeddingService - EmbeddingService instance
 * @param {object} opts
 * @param {string} [opts.filePath] - Path to the source file (for re-ingestion tracking)
 * @param {string} [opts.content] - Markdown content (required if filePath not readable)
 * @param {string} [opts.nest] - Nest for memory entries
 * @param {string} [opts.branch] - Branch for memory entries
 * @param {string} [opts.agentId] - Agent ID for scoped entries
 * @returns {Promise<object>} Ingestion result with created entries and triples
 */
export async function ingestMarkdown(adapter, embeddingService, opts = {}) {
  const filePath = cleanString(opts.filePath, 1000) || '';
  let rawContent = opts.content || '';

  if (!rawContent && filePath) {
    try {
      rawContent = fs.readFileSync(filePath, 'utf8');
    } catch (err) {
      throw new Error(`Cannot read file: ${filePath} — ${err.message}`);
    }
  }

  if (!rawContent) {
    throw new Error('content or filePath is required');
  }

  const fileHash = sha256(rawContent);

  // Check re-ingestion
  if (filePath) {
    const existing = await checkAlreadyIngested(adapter, filePath, fileHash);
    if (existing) {
      return {
        skipped: true,
        reason: 'already_ingested',
        source_id: existing.id,
        ingested_at: existing.ingested_at,
        turn_count: existing.turn_count
      };
    }
  }

  const turns = parseMarkdownConversation(rawContent);
  if (turns.length === 0) {
    return { skipped: true, reason: 'no_turns_found', turn_count: 0 };
  }

  return _ingestTurns(adapter, embeddingService, turns, {
    filePath,
    fileHash,
    nest: opts.nest || '',
    branch: opts.branch || '',
    agentId: opts.agentId || '',
    format: 'markdown'
  });
}

/**
 * Ingest a JSON conversation into memory entries and KG triples.
 *
 * @param {object} adapter - Database adapter
 * @param {object} embeddingService - EmbeddingService instance
 * @param {object} opts
 * @param {string} [opts.filePath] - Path to the source file
 * @param {string|Array} [opts.content] - JSON content (string or parsed array)
 * @param {string} [opts.nest] - Nest for memory entries
 * @param {string} [opts.branch] - Branch for memory entries
 * @param {string} [opts.agentId] - Agent ID for scoped entries
 * @returns {Promise<object>} Ingestion result
 */
export async function ingestJson(adapter, embeddingService, opts = {}) {
  const filePath = cleanString(opts.filePath, 1000) || '';
  let rawContent = opts.content;

  if (!rawContent && filePath) {
    try {
      rawContent = fs.readFileSync(filePath, 'utf8');
    } catch (err) {
      throw new Error(`Cannot read file: ${filePath} — ${err.message}`);
    }
  }

  if (!rawContent) {
    throw new Error('content or filePath is required');
  }

  // Normalize to string for hashing
  const contentStr = typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent);
  const fileHash = sha256(contentStr);

  // Check re-ingestion
  if (filePath) {
    const existing = await checkAlreadyIngested(adapter, filePath, fileHash);
    if (existing) {
      return {
        skipped: true,
        reason: 'already_ingested',
        source_id: existing.id,
        ingested_at: existing.ingested_at,
        turn_count: existing.turn_count
      };
    }
  }

  const turns = parseJsonConversation(rawContent);
  if (turns.length === 0) {
    return { skipped: true, reason: 'no_turns_found', turn_count: 0 };
  }

  return _ingestTurns(adapter, embeddingService, turns, {
    filePath,
    fileHash,
    nest: opts.nest || '',
    branch: opts.branch || '',
    agentId: opts.agentId || '',
    format: 'json'
  });
}

/**
 * Core ingestion pipeline shared by Markdown and JSON parsers.
 * Processes turns: dedup check, store as memory, extract entities, create KG triples.
 */
async function _ingestTurns(adapter, embeddingService, turns, meta) {
  const results = {
    skipped: false,
    format: meta.format,
    turn_count: turns.length,
    stored_count: 0,
    dedup_skipped: 0,
    entities_extracted: 0,
    triples_created: 0,
    memory_ids: [],
    errors: []
  };

  // Build a fake store-like object for storeEntry and checkDuplicate
  const storeProxy = {
    enabled: true,
    adapter,
    embeddingService: embeddingService || null,
    dbPath: '',
    init: async () => {},
    getMeta: async (key) => {
      const row = await adapter.get('SELECT value FROM memory_meta WHERE key = ?', [key]);
      return row ? row.value : null;
    }
  };

  for (const turn of turns) {
    try {
      // Dedup check per turn
      const dedupResult = await checkDuplicate(adapter, embeddingService, turn.content, {
        threshold: 0.92,
        nest: meta.nest,
        branch: meta.branch
      });

      if (dedupResult.isDuplicate) {
        results.dedup_skipped++;
        continue;
      }

      // Store as memory entry
      const turnTitle = `${turn.role} (turn ${turn.index + 1})`;
      const entryResult = await storeEntry(storeProxy, {
        kind: 'conversation',
        title: turnTitle,
        content: turn.content,
        summary: turn.content.slice(0, 280),
        nest: meta.nest,
        branch: meta.branch,
        agent_id: meta.agentId,
        source_type: `conversation_${meta.format}`,
        source_ref: meta.filePath || '',
        tags: ['conversation', turn.role],
        importance: 30,
        confidence: 0.8
      });

      if (!entryResult.created) {
        results.dedup_skipped++;
        continue;
      }

      const memoryId = entryResult.memory.id;
      results.memory_ids.push(memoryId);
      results.stored_count++;

      // Entity extraction
      const entities = extractEntities(turn.content);
      results.entities_extracted += entities.length;

      // Create KG triples
      const tripleDefs = buildTriples(entities, turn.role, memoryId);
      for (const td of tripleDefs) {
        try {
          await addTriple(adapter, {
            subjectName: td.subjectName,
            predicate: td.predicate,
            objectName: td.objectName,
            sourceMemoryId: td.sourceMemoryId,
            sourceType: td.sourceType,
            confidence: td.confidence
          });
          results.triples_created++;
        } catch {
          // Non-fatal: skip individual triple failures
        }
      }
    } catch (err) {
      results.errors.push({ turn_index: turn.index, error: err.message });
    }
  }

  // Record source file for re-ingestion tracking
  if (meta.filePath) {
    const srcRecord = await recordSource(adapter, {
      filePath: meta.filePath,
      fileHash: meta.fileHash,
      turnCount: results.stored_count,
      memoryIds: results.memory_ids
    });
    results.source_id = srcRecord.id;
  }

  return results;
}
