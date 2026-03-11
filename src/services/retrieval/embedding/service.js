const DEFAULT_MODEL = 'sentence-transformers/all-MiniLM-L6-v2';

function normalizeProvider(provider) {
  if (provider === 'xenova') return 'huggingface';
  return provider || 'huggingface';
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
      const out = await extractor(text, { pooling: 'mean', normalize: true });
      const vector = Array.from(out.data || []);
      embeddings.push(vector);
    }
    if (embeddings.length > 0) this._dimensions = embeddings[0].length;
    this._lastError = '';
    return embeddings;
  }
}
