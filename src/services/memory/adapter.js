export class NodeSqliteAdapter {
  constructor(db) {
    this.db = db;
  }

  async exec(sql) {
    this.db.exec(sql);
  }

  async run(sql, params = []) {
    const stmt = this.db.prepare(sql);
    const result = stmt.run(...params);
    return {
      changes: result?.changes ?? 0,
      lastInsertRowid: result?.lastInsertRowid ?? null
    };
  }

  async get(sql, params = []) {
    const stmt = this.db.prepare(sql);
    return stmt.get(...params) || null;
  }

  async all(sql, params = []) {
    const stmt = this.db.prepare(sql);
    return stmt.all(...params) || [];
  }

  async transaction(fn) {
    if (this._inTransaction) {
      // Re-entrant: use SAVEPOINT instead of nested BEGIN
      const sp = `sp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      this.db.exec(`SAVEPOINT "${sp}"`);
      try {
        const result = await fn(this);
        this.db.exec(`RELEASE "${sp}"`);
        return result;
      } catch (err) {
        this.db.exec(`ROLLBACK TO "${sp}"`);
        throw err;
      }
    }
    this._inTransaction = true;
    this.db.exec('BEGIN');
    try {
      const result = await fn(this);
      this.db.exec('COMMIT');
      return result;
    } catch (err) {
      try { this.db.exec('ROLLBACK'); } catch { /* already rolled back */ }
      throw err;
    } finally {
      this._inTransaction = false;
    }
  }
}
