/** Core adapter, scope, and migration types for the memory subsystem. */

// ---------------------------------------------------------------------------
// Database adapter
// ---------------------------------------------------------------------------

export interface RunResult {
  changes: number;
  lastInsertRowid: number | bigint | null;
}

export interface Adapter {
  exec(sql: string): Promise<void>;
  run(sql: string, params?: unknown[]): Promise<RunResult>;
  get<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T | null>;
  all<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]>;
  transaction<T>(fn: (ad: Adapter) => Promise<T>): Promise<T>;
}

// ---------------------------------------------------------------------------
// Scope
// ---------------------------------------------------------------------------

export interface Scope {
  root_path: string;
  project_path: string;
  branch_name: string;
  topic: string;
  feature: string;
}

export interface ScopeInput {
  root_path?: string;
  rootPath?: string;
  project_path?: string;
  projectPath?: string;
  branch_name?: string;
  branchName?: string;
  topic?: string;
  feature?: string;
}

// ---------------------------------------------------------------------------
// Link
// ---------------------------------------------------------------------------

export interface Link {
  path: string;
  line: number | null;
  label: string;
}

// ---------------------------------------------------------------------------
// Schema / Migrations
// ---------------------------------------------------------------------------

export interface MigrationSpec {
  version: number;
  migrate: (ad: Adapter) => Promise<void>;
}

export interface MigrationContext {
  adapter: Adapter;
  getMeta: (key: string) => Promise<string | null>;
  setMeta?: (key: string, value: string) => Promise<void>;
}
