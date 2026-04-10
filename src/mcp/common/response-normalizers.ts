/* eslint-disable @typescript-eslint/no-explicit-any */

// Normalizer functions receive untyped service results and return well-shaped objects.
// Using `any` for inputs is intentional — these functions guard against missing/malformed data.

import { stripEmptyFields } from './terse-utils.js';

export interface NormalizedEmbedStatus {
  backend: string;
  ready: boolean;
  provider: string;
  model: string | null;
  enabled: boolean;
  available: boolean;
  dimensions: number | null;
  error: string | null;
  sqlite_vec_loaded: boolean | null;
  sqlite_vec_extension: Record<string, unknown> | null;
  sqlite_vec_table_ready: boolean | null;
  embedding: Record<string, unknown>;
}

export function normalizeEmbedStatus(status: any): NormalizedEmbedStatus {
  const embedding = status?.embedding || {};
  const provider = embedding.provider || 'none';
  const model = embedding.model || null;
  const enabled = Boolean(embedding.enabled);
  const available = embedding.available ?? false;

  return {
    backend: status?.backend || 'json',
    ready: enabled ? Boolean(available) : true,
    provider,
    model,
    enabled,
    available,
    dimensions: embedding.dimensions ?? null,
    error: embedding.error || null,
    sqlite_vec_loaded: status?.sqlite_vec_loaded ?? status?.sqlite_vec_extension?.loaded ?? null,
    sqlite_vec_extension: status?.sqlite_vec_extension || null,
    sqlite_vec_table_ready: status?.sqlite_vec_table_ready ?? null,
    embedding
  };
}

export interface NormalizedIndexStatus {
  backend: string;
  total_files: number;
  total_chunks: number;
  upgrade_recommended: boolean;
  upgrade_reason: string | null;
  [key: string]: unknown;
}

export function normalizeIndexStatus(status: any): NormalizedIndexStatus {
  return {
    ...status,
    backend: status?.backend || 'json',
    total_files: Number.isFinite(status?.total_files) ? status.total_files : 0,
    total_chunks: Number.isFinite(status?.total_chunks) ? status.total_chunks : 0,
    upgrade_recommended: Boolean(status?.upgrade_recommended),
    upgrade_reason: status?.upgrade_reason || null
  };
}

export interface NormalizedIndexProjectResult {
  scanned_files: number;
  indexed_files: number;
  skipped_files: number;
  removed_files: number;
  failed_files: Array<Record<string, unknown>>;
  failed_file_count: number;
  failed_file_samples: Array<Record<string, unknown>>;
  total_files: number;
  total_chunks: number;
  max_files_requested: number;
  [key: string]: unknown;
}

export function normalizeIndexProjectResult(result: any, maxFiles: number): NormalizedIndexProjectResult {
  const failedFiles = Array.isArray(result?.failed_files) ? result.failed_files : [];
  return {
    ...result,
    scanned_files: Number.isFinite(result?.scanned_files) ? result.scanned_files : 0,
    indexed_files: Number.isFinite(result?.indexed_files) ? result.indexed_files : 0,
    skipped_files: Number.isFinite(result?.skipped_files) ? result.skipped_files : 0,
    removed_files: Number.isFinite(result?.removed_files) ? result.removed_files : 0,
    failed_files: failedFiles,
    failed_file_count: failedFiles.length,
    failed_file_samples: failedFiles.slice(0, 3),
    total_files: Number.isFinite(result?.total_files) ? result.total_files : 0,
    total_chunks: Number.isFinite(result?.total_chunks) ? result.total_chunks : 0,
    max_files_requested: maxFiles
  };
}

export interface NormalizedTaskContextResult {
  query: string;
  scope: {
    root_path: string;
    project_path: string;
    branch_name: string;
    topic: string;
    feature: string;
  };
  runtime: unknown;
  memory: {
    enabled: boolean;
    auto_capture: boolean;
    consent_done: boolean;
    backend_available: boolean;
    requested_backend: string | null;
    selected_backend: string | null;
    total_entries: number;
    total_events: number;
  };
  recall: {
    attempted: boolean;
    skipped_reason: string;
    count: number;
    items: unknown[];
  };
  guidance: string[];
}

export function normalizeTaskContextResult(result: any, input: any = {}): NormalizedTaskContextResult {
  const memory = result?.memory || {};
  const recall = result?.recall || {};
  const scope = result?.scope || {};

  return {
    query: result?.query || input.query || input.task || '',
    scope: {
      root_path: scope.root_path || input.root_path || '',
      project_path: scope.project_path || input.project_path || '',
      branch_name: scope.branch_name || input.branch_name || '',
      topic: scope.topic || input.topic || '',
      feature: scope.feature || input.feature || ''
    },
    runtime: result?.runtime || null,
    memory: {
      enabled: Boolean(memory.enabled),
      auto_capture: Boolean(memory.auto_capture),
      consent_done: Boolean(memory.consent_done),
      backend_available: Boolean(memory.backend_available),
      requested_backend: memory.requested_backend || null,
      selected_backend: memory.selected_backend || null,
      total_entries: Number.isFinite(memory.total_entries) ? memory.total_entries : 0,
      total_events: Number.isFinite(memory.total_events) ? memory.total_events : 0
    },
    recall: {
      attempted: Boolean(recall.attempted),
      skipped_reason: recall.skipped_reason || '',
      count: Number.isFinite(recall.count) ? recall.count : 0,
      items: Array.isArray(recall.items) ? recall.items : []
    },
    guidance: Array.isArray(result?.guidance) ? result.guidance : []
  };
}

export interface NormalizedMemoryStatus {
  enabled: boolean;
  auto_capture: boolean;
  consent_done: boolean;
  requested_backend: string | null;
  db_path: string | null;
  db_exists: boolean;
  db_dir: string | null;
  localnest_home: string | null;
  backend: {
    requested: string | null;
    selected: string | null;
    available: boolean;
    reason: string | null;
  };
  store: {
    initialized: boolean;
    total_entries: number;
    total_events: number;
    error: string | null;
  };
  [key: string]: unknown;
}

export function normalizeMemoryStatus(status: any): NormalizedMemoryStatus {
  const backend = status?.backend || {};
  const store = status?.store || {};

  return {
    ...status,
    enabled: Boolean(status?.enabled),
    auto_capture: Boolean(status?.auto_capture),
    consent_done: Boolean(status?.consent_done),
    requested_backend: status?.requested_backend ?? backend.requested ?? null,
    db_path: status?.db_path || null,
    db_exists: Boolean(status?.db_exists),
    db_dir: status?.db_dir || null,
    localnest_home: status?.localnest_home || null,
    backend: {
      requested: backend.requested ?? status?.requested_backend ?? null,
      selected: backend.selected ?? null,
      available: Boolean(backend.available),
      reason: backend.reason || null
    },
    store: {
      initialized: Boolean(store.initialized),
      total_entries: Number.isFinite(store.total_entries) ? store.total_entries : 0,
      total_events: Number.isFinite(store.total_events) ? store.total_events : 0,
      error: store.error || null
    }
  };
}

export interface NormalizedMemoryRecallResult {
  query: string;
  count: number;
  items: unknown[];
  [key: string]: unknown;
}

export function normalizeMemoryRecallResult(result: any, query: string = ''): NormalizedMemoryRecallResult {
  const items = Array.isArray(result?.items) ? result.items.map(stripEmptyFields) : [];
  return {
    ...result,
    query: result?.query || query,
    count: Number.isFinite(result?.count) ? result.count : 0,
    items
  };
}

export interface NormalizedMemoryEntryPayload {
  id: string | null;
  kind: string | null;
  title: string | null;
  summary: string;
  content: string;
  status: string | null;
  importance: number | null;
  confidence: number | null;
  revisions: unknown[];
  memory: unknown;
  [key: string]: unknown;
}

export function normalizeMemoryEntryPayload(entry: any, extras: Record<string, unknown> = {}): NormalizedMemoryEntryPayload {
  if (!entry || typeof entry !== 'object') {
    return { ...extras, id: null, kind: null, title: null, summary: '', content: '', status: null, importance: null, confidence: null, revisions: [], memory: entry ?? null } as NormalizedMemoryEntryPayload;
  }

  const payload = {
    ...extras,
    id: entry.id ?? null,
    kind: entry.kind ?? null,
    title: entry.title ?? null,
    summary: entry.summary ?? '',
    content: entry.content ?? '',
    status: entry.status ?? null,
    importance: entry.importance ?? null,
    confidence: entry.confidence ?? null,
    revisions: Array.isArray(entry.revisions) ? entry.revisions : [],
    memory: entry
  };
  return stripEmptyFields(payload) as NormalizedMemoryEntryPayload;
}

export interface NormalizedDeleteResult {
  id: string | null;
  deleted: boolean;
}

export function normalizeDeleteResult(result: any, fallback: { id?: string } = {}): NormalizedDeleteResult {
  return {
    id: result?.id ?? fallback.id ?? null,
    deleted: Boolean(result?.deleted)
  };
}

export interface NormalizedMemoryEventsResult {
  count: number;
  items: unknown[];
  [key: string]: unknown;
}

export function normalizeMemoryEventsResult(result: any): NormalizedMemoryEventsResult {
  return {
    ...result,
    count: Number.isFinite(result?.count) ? result.count : 0,
    items: Array.isArray(result?.items) ? result.items : []
  };
}

export interface NormalizedMemorySuggestionResult {
  id: string;
  source_title: string | null;
  count: number;
  threshold: number;
  using_embeddings: boolean;
  suggestions: unknown[];
  [key: string]: unknown;
}

export function normalizeMemorySuggestionResult(result: any, id: string, threshold: number): NormalizedMemorySuggestionResult {
  return {
    ...result,
    id: result?.id ?? id,
    source_title: result?.source_title || null,
    count: Number.isFinite(result?.count) ? result.count : 0,
    threshold: result?.threshold ?? threshold,
    using_embeddings: Boolean(result?.using_embeddings),
    suggestions: Array.isArray(result?.suggestions) ? result.suggestions : []
  };
}

export interface NormalizedRelationResult {
  source_id: string;
  target_id: string;
  relation_type: string;
}

export function normalizeRelationResult(result: any, fallback: { source_id: string; target_id: string; relation_type: string }): NormalizedRelationResult {
  return {
    source_id: result?.source_id ?? fallback.source_id,
    target_id: result?.target_id ?? fallback.target_id,
    relation_type: result?.relation_type ?? fallback.relation_type
  };
}

export interface NormalizedRelationRemovalResult {
  removed: boolean;
  source_id: string;
  target_id: string;
}

export function normalizeRelationRemovalResult(result: any, fallback: { source_id: string; target_id: string }): NormalizedRelationRemovalResult {
  return {
    removed: Boolean(result?.removed),
    source_id: result?.source_id ?? fallback.source_id,
    target_id: result?.target_id ?? fallback.target_id
  };
}

export interface NormalizedRelatedMemoriesResult {
  id: string;
  count: number;
  related: unknown[];
  [key: string]: unknown;
}

export function normalizeRelatedMemoriesResult(result: any, id: string): NormalizedRelatedMemoriesResult {
  return {
    ...result,
    id: result?.id ?? id,
    count: Number.isFinite(result?.count) ? result.count : 0,
    related: Array.isArray(result?.related) ? result.related : []
  };
}

export interface NormalizedCaptureOutcomeResult {
  captured: boolean;
  skipped_reason: string;
  runtime: unknown;
  memory: NormalizedMemoryStatus;
  event: unknown;
  result: unknown;
}

export function normalizeCaptureOutcomeResult(result: any): NormalizedCaptureOutcomeResult {
  return {
    captured: Boolean(result?.captured),
    skipped_reason: result?.skipped_reason || '',
    runtime: result?.runtime || null,
    memory: normalizeMemoryStatus(result?.memory || {}),
    event: result?.event || null,
    result: result?.result || null
  };
}

export interface NormalizedUpdateStatus {
  package_name: string | null;
  update_channel: string;
  channel: string;
  current_version: string | null;
  latest_version: string | null;
  current: string | null;
  latest: string | null;
  is_outdated: boolean;
  checked_via: string | null;
  source: string | null;
  last_checked_at: string | null;
  last_check_ok: boolean | null;
  error: string | null;
  recommend_update_prompt: boolean;
  next_check_after_minutes: number | null;
  cache_path: string | null;
  checked_at_ms: number | null;
  checked_age_minutes: number | null;
  next_check_at: string | null;
  using_cached_data: boolean;
  can_attempt_update: boolean;
  recommendation: string;
}

export function normalizeUpdateStatus(result: any): NormalizedUpdateStatus {
  return {
    package_name: result?.package_name || null,
    update_channel: result?.update_channel || 'stable',
    channel: result?.update_channel || 'stable',
    current_version: result?.current_version || null,
    latest_version: result?.latest_version || null,
    current: result?.current_version || null,
    latest: result?.latest_version || null,
    is_outdated: Boolean(result?.is_outdated),
    checked_via: result?.checked_via || null,
    source: result?.source || null,
    last_checked_at: result?.last_checked_at || null,
    last_check_ok: result?.last_check_ok ?? null,
    error: result?.error || null,
    recommend_update_prompt: Boolean(result?.recommend_update_prompt),
    next_check_after_minutes: result?.next_check_after_minutes ?? null,
    cache_path: result?.cache_path || null,
    checked_at_ms: result?.checked_at_ms ?? null,
    checked_age_minutes: result?.checked_age_minutes ?? null,
    next_check_at: result?.next_check_at || null,
    using_cached_data: Boolean(result?.using_cached_data),
    can_attempt_update: Boolean(result?.can_attempt_update),
    recommendation: result?.recommendation || 'up_to_date'
  };
}

export interface NormalizedUpdateSelfResult {
  ok: boolean;
  skipped: boolean;
  dry_run: boolean;
  restart_required: boolean;
  reason: string | null;
  message: string | null;
  step: string | null;
  planned_commands: string[];
  validation: unknown;
  install: unknown;
  skill_sync: unknown;
  update_status: NormalizedUpdateStatus | null;
  [key: string]: unknown;
}

export function normalizeUpdateSelfResult(result: any): NormalizedUpdateSelfResult {
  return {
    ...result,
    ok: Boolean(result?.ok),
    skipped: Boolean(result?.skipped),
    dry_run: Boolean(result?.dry_run),
    restart_required: Boolean(result?.restart_required),
    reason: result?.reason || null,
    message: result?.message || null,
    step: result?.step || null,
    planned_commands: Array.isArray(result?.planned_commands) ? result.planned_commands : [],
    validation: result?.validation || null,
    install: result?.install || null,
    skill_sync: result?.skill_sync || null,
    update_status: result?.update_status ? normalizeUpdateStatus(result.update_status) : null
  };
}

export interface NormalizedProjectTreeResult {
  project_path: string;
  entries: unknown[];
  [key: string]: unknown;
}

export function normalizeProjectTreeResult(result: any, projectPath: string): NormalizedProjectTreeResult {
  const entries = Array.isArray(result)
    ? result
    : (Array.isArray(result?.entries) ? result.entries : []);

  return {
    ...result,
    project_path: result?.project_path || projectPath,
    entries
  };
}

export interface NormalizedSearchHybridResult {
  query: string;
  lexical_hits: number;
  semantic_hits: number;
  ranking_mode: string;
  auto_index: unknown;
  reranker: unknown;
  index_stale: boolean | null;
  index_staleness: unknown;
  results: unknown[];
  [key: string]: unknown;
}

export function normalizeSearchHybridResult(result: any, query: string): NormalizedSearchHybridResult {
  const results = Array.isArray(result?.results) ? result.results.map(stripEmptyFields) : [];
  return {
    ...result,
    query: result?.query || query,
    lexical_hits: Number.isFinite(result?.lexical_hits) ? result.lexical_hits : 0,
    semantic_hits: Number.isFinite(result?.semantic_hits) ? result.semantic_hits : 0,
    ranking_mode: result?.ranking_mode || 'hybrid',
    auto_index: result?.auto_index || null,
    reranker: result?.reranker || null,
    index_stale: result?.index_stale ?? null,
    index_staleness: result?.index_staleness || null,
    results
  };
}

export interface NormalizedSymbolResult {
  symbol: string;
  count: number;
  definitions: unknown[];
  exports: unknown[];
  [key: string]: unknown;
}

export function normalizeSymbolResult(result: any, symbol: string): NormalizedSymbolResult {
  return {
    ...result,
    symbol: result?.symbol || symbol,
    count: Number.isFinite(result?.count) ? result.count : 0,
    definitions: Array.isArray(result?.definitions) ? result.definitions : [],
    exports: Array.isArray(result?.exports) ? result.exports : []
  };
}

export interface NormalizedUsageResult {
  symbol: string;
  count: number;
  usages: unknown[];
  [key: string]: unknown;
}

export function normalizeUsageResult(result: any, symbol: string): NormalizedUsageResult {
  return {
    ...result,
    symbol: result?.symbol || symbol,
    count: Number.isFinite(result?.count) ? result.count : 0,
    usages: Array.isArray(result?.usages) ? result.usages : []
  };
}

export interface NormalizedReadFileChunkResult {
  path: string;
  start_line: number;
  end_line: number;
  lines: string[];
  [key: string]: unknown;
}

export function normalizeReadFileChunkResult(result: any, requestedPath: string, startLine: number, endLine: number): NormalizedReadFileChunkResult {
  const content = typeof result?.content === 'string' ? result.content : '';
  const lines: string[] = Array.isArray(result?.lines)
    ? result.lines
    : (content ? content.split(/\r?\n/).filter(Boolean) : []);

  return {
    ...result,
    path: result?.path || requestedPath,
    start_line: Number.isFinite(result?.start_line) ? result.start_line : startLine,
    end_line: Number.isFinite(result?.end_line) ? result.end_line : endLine,
    lines
  };
}

export interface NormalizedProjectSummaryResult {
  project_path: string;
  summary: string;
  [key: string]: unknown;
}

export function normalizeProjectSummaryResult(result: any, projectPath: string): NormalizedProjectSummaryResult {
  return {
    ...result,
    project_path: result?.project_path || projectPath,
    summary: result?.summary || ''
  };
}
