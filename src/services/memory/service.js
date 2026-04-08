import fs from 'node:fs';
import path from 'node:path';
import { MemoryStore } from './store.js';

function parseNodeMajor(version) {
  const major = Number.parseInt(String(version || '').split('.')[0] || '0', 10);
  return Number.isFinite(major) ? major : 0;
}

export class MemoryService {
  constructor({
    localnestHome,
    enabled,
    backend,
    dbPath,
    autoCapture,
    consentDone,
    embeddingService
  }) {
    this.localnestHome = localnestHome;
    this.enabled = enabled;
    this.backend = backend;
    this.dbPath = dbPath;
    this.autoCapture = autoCapture;
    this.consentDone = consentDone;
    this.store = new MemoryStore({
      enabled,
      backend,
      dbPath,
      embeddingService: embeddingService || null
    });
  }

  async detectBackend() {
    const requested = this.backend || 'auto';
    const nodeMajor = parseNodeMajor(process.versions?.node);

    if (requested === 'node-sqlite') {
      return {
        requested,
        selected: await this._supportsNodeSqlite() ? 'node-sqlite' : null,
        available: await this._supportsNodeSqlite()
      };
    }

    if (requested === 'sqlite3') {
      return {
        requested,
        selected: null,
        available: false,
        reason: 'sqlite3 fallback is disabled in published builds due to upstream audit vulnerabilities'
      };
    }

    const supportsNodeSqlite = await this._supportsNodeSqlite();
    if (supportsNodeSqlite) {
      return {
        requested,
        selected: 'node-sqlite',
        available: true,
        reason: nodeMajor >= 22 ? 'built-in node:sqlite available' : 'node:sqlite available'
      };
    }

    return {
      requested,
      selected: null,
      available: false,
      reason: 'No supported SQLite backend detected. Use Node 22.13+ for local memory support.'
    };
  }

  async getStatus() {
    const backend = await this.detectBackend();
    let storeStatus = {
      initialized: false
    };

    if (this.enabled && backend.available) {
      try {
        storeStatus = await this.store.getStatus();
      } catch (error) {
        storeStatus = {
          initialized: false,
          error: error?.message || String(error)
        };
      }
    }

    return {
      enabled: this.enabled,
      auto_capture: this.autoCapture,
      consent_done: this.consentDone,
      requested_backend: this.backend,
      backend,
      db_path: this.dbPath,
      db_exists: fs.existsSync(this.dbPath),
      db_dir: path.dirname(this.dbPath),
      localnest_home: this.localnestHome,
      store: storeStatus
    };
  }

  async listEntries(args = {}) {
    this.assertEnabled();
    return this.store.listEntries(args);
  }

  async getEntry(id) {
    this.assertEnabled();
    return this.store.getEntry(id);
  }

  async storeEntry(input) {
    this.assertEnabled();
    return this.store.storeEntry(input);
  }

  async updateEntry(id, patch) {
    this.assertEnabled();
    return this.store.updateEntry(id, patch);
  }

  async deleteEntry(id) {
    this.assertEnabled();
    return this.store.deleteEntry(id);
  }

  async recall(args = {}) {
    this.assertEnabled();
    return this.store.recall(args);
  }

  async captureEvent(input = {}) {
    this.assertEnabled();
    return this.store.captureEvent(input);
  }

  async listEvents(args = {}) {
    this.assertEnabled();
    return this.store.listEvents(args);
  }

  async suggestRelations(memoryId, options = {}) {
    this.assertEnabled();
    return this.store.suggestRelations(memoryId, options);
  }

  async addRelation(sourceId, targetId, relationType = 'related') {
    this.assertEnabled();
    return this.store.addRelation(sourceId, targetId, relationType);
  }

  async removeRelation(sourceId, targetId) {
    this.assertEnabled();
    return this.store.removeRelation(sourceId, targetId);
  }

  async getRelated(memoryId) {
    this.assertEnabled();
    return this.store.getRelated(memoryId);
  }

  async addEntity(args) {
    this.assertEnabled();
    return this.store.addEntity(args);
  }

  async getEntity(entityId) {
    this.assertEnabled();
    return this.store.getEntity(entityId);
  }

  async addTriple(args) {
    this.assertEnabled();
    return this.store.addTriple(args);
  }

  async invalidateTriple(tripleId, validTo) {
    this.assertEnabled();
    return this.store.invalidateTriple(tripleId, validTo);
  }

  async queryEntityRelationships(entityId, opts = {}) {
    this.assertEnabled();
    return this.store.queryEntityRelationships(entityId, opts);
  }

  async queryTriplesAsOf(entityId, asOfDate) {
    this.assertEnabled();
    return this.store.queryTriplesAsOf(entityId, asOfDate);
  }

  async getEntityTimeline(entityId) {
    this.assertEnabled();
    return this.store.getEntityTimeline(entityId);
  }

  async getKgStats() {
    this.assertEnabled();
    return this.store.getKgStats();
  }

  async listNests() {
    this.assertEnabled();
    return this.store.listNests();
  }

  async listBranches(nest) {
    this.assertEnabled();
    return this.store.listBranches(nest);
  }

  async getTaxonomyTree() {
    this.assertEnabled();
    return this.store.getTaxonomyTree();
  }

  assertEnabled() {
    if (!this.enabled) {
      throw new Error('Local memory is disabled. Re-run localnest setup and opt in to memory.');
    }
  }

  async _supportsNodeSqlite() {
    try {
      const mod = await import('node:sqlite');
      return Boolean(mod?.DatabaseSync);
    } catch {
      return false;
    }
  }
}
