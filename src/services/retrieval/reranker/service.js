const DEFAULT_MODEL = 'cross-encoder/ms-marco-MiniLM-L-6-v2';

function normalizeProvider(provider) {
  if (provider === 'xenova') return 'huggingface';
  return provider || 'huggingface';
}

function sigmoid(value) {
  const n = Number(value) || 0;
  if (n >= 0) {
    const z = Math.exp(-n);
    return 1 / (1 + z);
  }
  const z = Math.exp(n);
  return z / (1 + z);
}

export class RerankerService {
  constructor({ provider = 'huggingface', model, cacheDir } = {}) {
    this.provider = normalizeProvider(provider);
    this.model = model || DEFAULT_MODEL;
    this.cacheDir = cacheDir || '';
    this._modelPromise = null;
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
      available: this._available,
      error: this._lastError || undefined
    };
  }

  async _getModelBundle() {
    if (this._modelPromise) return this._modelPromise;

    this._modelPromise = (async () => {
      const mod = await import('@huggingface/transformers');
      const { AutoTokenizer, AutoModelForSequenceClassification } = mod;
      if (this.cacheDir) {
        mod.env.cacheDir = this.cacheDir;
      }
      const [tokenizer, model] = await Promise.all([
        AutoTokenizer.from_pretrained(this.model),
        AutoModelForSequenceClassification.from_pretrained(this.model)
      ]);
      return { tokenizer, model };
    })();

    try {
      const bundle = await this._modelPromise;
      this._available = true;
      return bundle;
    } catch (error) {
      this._available = false;
      this._lastError = String(error?.message || error);
      this._modelPromise = null;
      throw error;
    }
  }

  async rawScore(query, text) {
    if (!this.isEnabled()) return 0;
    const { tokenizer, model } = await this._getModelBundle();
    const inputs = await tokenizer(String(query), {
      text_pair: String(text),
      padding: true,
      truncation: true
    });
    const out = await model(inputs);
    return Number(out?.logits?.data?.[0] || 0);
  }

  async score(query, text) {
    try {
      return sigmoid(await this.rawScore(query, text));
    } catch (error) {
      this._available = false;
      this._lastError = String(error?.message || error);
      return 0;
    }
  }

  async rerank(query, candidates) {
    if (!this.isEnabled() || !Array.isArray(candidates) || candidates.length === 0) return [];
    const out = [];
    for (const candidate of candidates) {
      const snippet = candidate.text || candidate.snippet || candidate.file || '';
      try {
        const score = await this.score(query, String(snippet));
        out.push(score);
      } catch (error) {
        this._available = false;
        this._lastError = String(error?.message || error);
        return [];
      }
    }
    this._lastError = '';
    return out;
  }
}
