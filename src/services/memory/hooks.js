/**
 * Hooks system for LocalNest memory operations.
 *
 * Allows external consumers (AI clients, plugins, automation) to register
 * pre/post callbacks on memory and knowledge graph operations.
 *
 * Usage:
 *   import { MemoryHooks } from './hooks.js';
 *   const hooks = new MemoryHooks();
 *   hooks.on('before:store', async (entry) => { ... });
 *   hooks.on('after:store', async (entry, result) => { ... });
 *   hooks.on('before:recall', async (query) => { ... });
 *   hooks.on('after:recall', async (query, results) => { ... });
 */

const VALID_EVENTS = new Set([
  // Memory entry lifecycle
  'before:store', 'after:store',
  'before:update', 'after:update',
  'before:delete', 'after:delete',
  'before:recall', 'after:recall',

  // Knowledge graph
  'before:kg:addEntity', 'after:kg:addEntity',
  'before:kg:addTriple', 'after:kg:addTriple',
  'before:kg:invalidate', 'after:kg:invalidate',

  // Graph traversal
  'before:graph:traverse', 'after:graph:traverse',
  'before:graph:bridges', 'after:graph:bridges',

  // Agent diary
  'before:diary:write', 'after:diary:write',

  // Ingestion
  'before:ingest', 'after:ingest',

  // Dedup
  'before:dedup', 'after:dedup',

  // Taxonomy
  'before:nest:list', 'after:nest:list',

  // Catch-all
  'before:*', 'after:*',
  'error'
]);

export class MemoryHooks {
  constructor() {
    this._listeners = new Map();
    this._enabled = true;
  }

  /**
   * Register a hook listener.
   * @param {string} event — One of VALID_EVENTS or a custom event
   * @param {Function} fn — async (payload, context?) => void
   * @returns {{ remove: () => void }} — Unsubscribe handle
   */
  on(event, fn) {
    if (typeof fn !== 'function') throw new Error('Hook listener must be a function');
    if (!this._listeners.has(event)) {
      this._listeners.set(event, []);
    }
    this._listeners.get(event).push(fn);
    return {
      remove: () => {
        const arr = this._listeners.get(event);
        if (arr) {
          const idx = arr.indexOf(fn);
          if (idx !== -1) arr.splice(idx, 1);
        }
      }
    };
  }

  /**
   * Register a one-time hook listener.
   */
  once(event, fn) {
    const handle = this.on(event, async (...args) => {
      handle.remove();
      return fn(...args);
    });
    return handle;
  }

  /**
   * Emit a hook event. Runs all listeners sequentially.
   * If a before:* listener returns { cancel: true }, the operation is skipped.
   * @param {string} event
   * @param {*} payload
   * @param {object} [context] — optional context (tool name, caller, etc.)
   * @returns {{ cancelled: boolean, payload: * }}
   */
  async emit(event, payload, context = {}) {
    if (!this._enabled) return { cancelled: false, payload };

    const listeners = [
      ...(this._listeners.get(event) || []),
      ...(event.startsWith('before:') ? (this._listeners.get('before:*') || []) : []),
      ...(event.startsWith('after:') ? (this._listeners.get('after:*') || []) : [])
    ];

    let currentPayload = payload;
    for (const fn of listeners) {
      try {
        const result = await fn(currentPayload, { event, ...context });
        if (result && typeof result === 'object') {
          if (result.cancel === true) {
            return { cancelled: true, payload: currentPayload, reason: result.reason || 'cancelled by hook' };
          }
          if (result.payload !== undefined) {
            currentPayload = result.payload;
          }
        }
      } catch (err) {
        await this._emitError(event, err, currentPayload);
      }
    }

    return { cancelled: false, payload: currentPayload };
  }

  /**
   * Emit error event.
   */
  async _emitError(sourceEvent, error, payload) {
    const errorListeners = this._listeners.get('error') || [];
    for (const fn of errorListeners) {
      try {
        await fn({ sourceEvent, error, payload });
      } catch {
        // Swallow errors in error handlers to prevent infinite loops
      }
    }
  }

  /**
   * Enable/disable all hooks.
   */
  setEnabled(enabled) {
    this._enabled = Boolean(enabled);
  }

  /**
   * Get hook stats.
   */
  getStats() {
    const stats = {};
    for (const [event, listeners] of this._listeners) {
      if (listeners.length > 0) {
        stats[event] = listeners.length;
      }
    }
    return {
      enabled: this._enabled,
      total_listeners: Array.from(this._listeners.values()).reduce((sum, arr) => sum + arr.length, 0),
      events: stats
    };
  }

  /**
   * Remove all listeners for an event, or all listeners entirely.
   */
  removeAll(event) {
    if (event) {
      this._listeners.delete(event);
    } else {
      this._listeners.clear();
    }
  }

  /**
   * List all valid event names.
   */
  static validEvents() {
    return [...VALID_EVENTS];
  }
}
