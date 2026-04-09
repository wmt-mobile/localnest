import { createHash } from 'node:crypto';

const DEFAULT_MODEL = 'sentence-transformers/all-MiniLM-L6-v2';
const LRU_MAX_ENTRIES = 256;

function normalizeProvider(provider) {
  if (provider === 'xenova') return 'huggingface';
  return provider || 'huggingface';
}

/**
 * Simple Map-based LRU cache. Map insertion order is used for eviction —
 * on every hit we delete-then-re-insert so the entry moves to the end,
 * and eviction always removes the first (oldest-accessed) entry.
 */
class EmbeddingLRUCache {
  constructor(maxEntries = LRU_MAX_ENTRIES) {
    this._map = new Map();
    this._max = maxEntries;
  }

  _keyFor(text) {
    return createHash('sha256').update(text).digest('hex');
  }

  get(text) {
    const key = this._keyFor(text);
    if (!this._map.has(key)) return undefined;
    const value = this._map.get(key);
    // Move to end (most-recently-used)
    this._map.delete(key);
    this._map.set(key, value);
    return value;
  }

  set(text, vector) {
    const key = this._keyFor(text);
    if (this._map.has(key)) {
      this._map.delete(key);
    } else if (this._map.size >= this._max) {
      // Evict least-recently-used (first entry)
      const firstKey = this._map.keys().next().value;
      this._map.delete(firstKey);
    }
    this._map.set(key, vector);
  }

  clear() {
    this._map.clear();
  }

  get size() {
    return this._map.size;
  }
}

export class EmbeddingService {
  constructor({ provider = 'huggingface', model, cacheDir } = {}) {
    this.provider = normalizeProvider(provider);
    this.model = model || DEFAULT_MODEL;
    this.cacheDir = cacheDir || '';
    this._dimensions = null;
    this._pipelinePromise = null;
    this._available = false;
    this._lastError = '';
    this._cache = new EmbeddingLRUCache();
  }

  isEnabled() {
    return this.provider !== 'none';
  }

  getStatus() {
    return {
      provider: this.provider,
      model: this.model,
      enabled: this.isEnabled(),
      dimensions: this._dimensions,
      available: this._available,
      error: this._lastError || undefined
    };
  }

  async embed(text) {
    const results = await this.embedBatch([text]);
    return results[0] ?? null;
  }

  async embedBatch(texts) {
    if (!this.isEnabled() || texts.length === 0) return [];
    if (this.provider === 'huggingface') return this._huggingfaceBatch(texts);
    return [];
  }

  async _getPipeline() {
    if (this._pipelinePromise) return this._pipelinePromise;

    this._pipelinePromise = (async () => {
      const mod = await import('@huggingface/transformers');
      if (this.cacheDir) {
        mod.env.cacheDir = this.cacheDir;
      }
      return mod.pipeline('feature-extraction', this.model);
    })();

    try {
      const pipeline = await this._pipelinePromise;
      this._available = true;
      return pipeline;
    } catch (error) {
      this._available = false;
      this._lastError = String(error?.message || error);
      this._pipelinePromise = null;
      throw error;
    }
  }

  async _huggingfaceBatch(texts) {
    const extractor = await this._getPipeline();
    const embeddings = [];
    for (const text of texts) {
      const cached = this._cache.get(text);
      if (cached) {
        embeddings.push(cached);
        continue;
      }
      const out = await extractor(text, { pooling: 'mean', normalize: true });
      const vector = Array.from(out.data || []);
      this._cache.set(text, vector);
      embeddings.push(vector);
    }
    if (embeddings.length > 0) this._dimensions = embeddings[0].length;
    this._lastError = '';
    return embeddings;
  }

  clearCache() {
    this._cache.clear();
  }
}
