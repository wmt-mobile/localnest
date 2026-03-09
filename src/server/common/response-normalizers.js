export function normalizeEmbedStatus(status) {
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

export function normalizeIndexStatus(status) {
  return {
    ...status,
    backend: status?.backend || 'json',
    total_files: Number.isFinite(status?.total_files) ? status.total_files : 0,
    total_chunks: Number.isFinite(status?.total_chunks) ? status.total_chunks : 0,
    upgrade_recommended: Boolean(status?.upgrade_recommended),
    upgrade_reason: status?.upgrade_reason || null
  };
}

export function normalizeIndexProjectResult(result, maxFiles) {
  return {
    ...result,
    scanned_files: Number.isFinite(result?.scanned_files) ? result.scanned_files : 0,
    indexed_files: Number.isFinite(result?.indexed_files) ? result.indexed_files : 0,
    skipped_files: Number.isFinite(result?.skipped_files) ? result.skipped_files : 0,
    removed_files: Number.isFinite(result?.removed_files) ? result.removed_files : 0,
    failed_files: Array.isArray(result?.failed_files) ? result.failed_files : [],
    total_files: Number.isFinite(result?.total_files) ? result.total_files : 0,
    total_chunks: Number.isFinite(result?.total_chunks) ? result.total_chunks : 0,
    max_files_requested: maxFiles
  };
}

export function normalizeTaskContextResult(result, input = {}) {
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

export function normalizeMemoryStatus(status) {
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

export function normalizeMemoryRecallResult(result, query = '') {
  return {
    ...result,
    query: result?.query || query,
    count: Number.isFinite(result?.count) ? result.count : 0,
    items: Array.isArray(result?.items) ? result.items : []
  };
}

export function normalizeMemoryEntryPayload(entry, extras = {}) {
  if (!entry || typeof entry !== 'object') {
    return { ...extras, memory: entry ?? null };
  }

  return {
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
}

export function normalizeDeleteResult(result, fallback = {}) {
  return {
    id: result?.id ?? fallback.id ?? null,
    deleted: Boolean(result?.deleted)
  };
}

export function normalizeMemoryEventsResult(result) {
  return {
    ...result,
    count: Number.isFinite(result?.count) ? result.count : 0,
    items: Array.isArray(result?.items) ? result.items : []
  };
}

export function normalizeMemorySuggestionResult(result, id, threshold) {
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

export function normalizeRelationResult(result, fallback) {
  return {
    source_id: result?.source_id ?? fallback.source_id,
    target_id: result?.target_id ?? fallback.target_id,
    relation_type: result?.relation_type ?? fallback.relation_type
  };
}

export function normalizeRelationRemovalResult(result, fallback) {
  return {
    removed: Boolean(result?.removed),
    source_id: result?.source_id ?? fallback.source_id,
    target_id: result?.target_id ?? fallback.target_id
  };
}

export function normalizeRelatedMemoriesResult(result, id) {
  return {
    ...result,
    id: result?.id ?? id,
    count: Number.isFinite(result?.count) ? result.count : 0,
    related: Array.isArray(result?.related) ? result.related : []
  };
}

export function normalizeCaptureOutcomeResult(result) {
  return {
    captured: Boolean(result?.captured),
    skipped_reason: result?.skipped_reason || '',
    runtime: result?.runtime || null,
    memory: normalizeMemoryStatus(result?.memory || {}),
    event: result?.event || null,
    result: result?.result || null
  };
}

export function normalizeUpdateStatus(result) {
  return {
    package_name: result?.package_name || null,
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
    cache_path: result?.cache_path || null
  };
}

export function normalizeUpdateSelfResult(result) {
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
    install: result?.install || null,
    skill_sync: result?.skill_sync || null,
    update_status: result?.update_status ? normalizeUpdateStatus(result.update_status) : null
  };
}

export function normalizeProjectTreeResult(result, projectPath) {
  const entries = Array.isArray(result)
    ? result
    : (Array.isArray(result?.entries) ? result.entries : []);

  return {
    ...result,
    project_path: result?.project_path || projectPath,
    entries
  };
}

export function normalizeSearchHybridResult(result, query) {
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
    results: Array.isArray(result?.results) ? result.results : []
  };
}

export function normalizeSymbolResult(result, symbol) {
  return {
    ...result,
    symbol: result?.symbol || symbol,
    count: Number.isFinite(result?.count) ? result.count : 0,
    definitions: Array.isArray(result?.definitions) ? result.definitions : [],
    exports: Array.isArray(result?.exports) ? result.exports : []
  };
}

export function normalizeUsageResult(result, symbol) {
  return {
    ...result,
    symbol: result?.symbol || symbol,
    count: Number.isFinite(result?.count) ? result.count : 0,
    usages: Array.isArray(result?.usages) ? result.usages : []
  };
}

export function normalizeReadFileChunkResult(result, requestedPath, startLine, endLine) {
  const content = typeof result?.content === 'string' ? result.content : '';
  const lines = Array.isArray(result?.lines)
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

export function normalizeProjectSummaryResult(result, projectPath) {
  return {
    ...result,
    project_path: result?.project_path || projectPath,
    summary: result?.summary || ''
  };
}
