function buildMemoryGuidance(status) {
  if (status.enabled && (status.backend?.available || false)) {
    return [
      'For non-trivial debugging, implementation, review, or repeated project work: call localnest_task_context before deeper analysis.',
      'After meaningful fixes, decisions, review findings, or user preference discoveries: call localnest_capture_outcome.',
      'Do not use memory in place of file evidence; verify with search/read tools before concluding.'
    ];
  }

  return [
    'Memory is unavailable or disabled; rely on retrieval tools only unless the user opts in during setup.'
  ];
}

function buildMemorySummary(status) {
  return {
    enabled: status.enabled,
    auto_capture: status.auto_capture,
    consent_done: status.consent_done,
    backend_available: status.backend?.available || false,
    requested_backend: status.backend?.requested || status.requested_backend,
    selected_backend: status.backend?.selected || null,
    total_entries: status.store?.total_entries || 0,
    total_events: status.store?.total_events || 0,
    guidance: buildMemoryGuidance(status)
  };
}

function buildHealthSummary({ runtime, memoryStatus, indexStatus, activeIndexBackend }) {
  const memoryAvailable = Boolean(memoryStatus?.enabled && memoryStatus?.backend?.available);
  const vectorReady = Boolean(activeIndexBackend && indexStatus);
  const sqliteVecNativeReady = activeIndexBackend !== 'sqlite-vec'
    || Boolean(indexStatus?.sqlite_vec_extension?.configured && indexStatus?.sqlite_vec_loaded && indexStatus?.sqlite_vec_table_ready);
  const issues = [];

  if (!runtime.hasRipgrep) issues.push('ripgrep_unavailable');
  if (!vectorReady) issues.push('vector_index_unavailable');
  if (indexStatus?.error) issues.push('vector_index_status_error');
  if (!sqliteVecNativeReady) issues.push('sqlite_vec_native_missing');
  if (runtime.embeddingCacheStatus?.fallbackUsed) issues.push('embedding_cache_fallback');
  if (runtime.rerankerCacheStatus?.fallbackUsed) issues.push('reranker_cache_fallback');

  return {
    overall: issues.length === 0 ? 'ok' : 'degraded',
    vector_index_ready: vectorReady,
    sqlite_vec_native_ready: sqliteVecNativeReady,
    memory_ready: memoryAvailable,
    has_ripgrep: runtime.hasRipgrep,
    issues,
    recommended_next_action: issues.length > 0
      ? 'Run localnest_usage_guide or doctor if runtime capabilities look degraded.'
      : 'Runtime looks healthy. Start with localnest_server_status or localnest_search_files.'
  };
}

export function createServerStatusBuilder({
  serverName,
  serverVersion,
  runtime,
  workspace,
  memory,
  updates,
  getActiveIndexBackend,
  vectorIndex
}) {
  return async function buildServerStatus() {
    const indexStatus = vectorIndex?.getStatus?.() || null;
    const activeIndexBackend = getActiveIndexBackend();
    const memoryStatus = await memory.getStatus();
    const updateStatus = updates.getCachedStatus
      ? updates.getCachedStatus()
      : await updates.getStatus({ force: false });

    return {
      name: serverName,
      version: serverVersion,
      mode: runtime.mcpMode,
      roots: workspace.listRoots(),
      has_ripgrep: runtime.hasRipgrep,
      health: buildHealthSummary({
        runtime,
        memoryStatus,
        indexStatus,
        activeIndexBackend
      }),
      memory: buildMemorySummary(memoryStatus),
      search: {
        auto_project_split: runtime.autoProjectSplit,
        max_auto_projects: runtime.maxAutoProjects,
        force_split_children: runtime.forceSplitChildren,
        rg_timeout_ms: runtime.rgTimeoutMs
      },
      vector_index: {
        backend: activeIndexBackend,
        requested_backend: runtime.indexBackend,
        index_path: runtime.vectorIndexPath,
        db_path: runtime.sqliteDbPath,
        chunk_lines: runtime.vectorChunkLines,
        chunk_overlap: runtime.vectorChunkOverlap,
        max_terms_per_chunk: runtime.vectorMaxTermsPerChunk,
        max_indexed_files: runtime.vectorMaxIndexedFiles,
        embedding_provider: runtime.embeddingProvider,
        embedding_model: runtime.embeddingModel,
        embedding_cache_dir: runtime.embeddingCacheDir,
        embedding_cache_status: runtime.embeddingCacheStatus || null,
        embedding_dimensions: runtime.embeddingDimensions,
        reranker_provider: runtime.rerankerProvider,
        reranker_model: runtime.rerankerModel,
        reranker_cache_dir: runtime.rerankerCacheDir,
        reranker_cache_status: runtime.rerankerCacheStatus || null,
        diagnostics: {
          sqlite_vec_loaded: indexStatus?.sqlite_vec_loaded ?? indexStatus?.sqlite_vec_extension?.loaded ?? null,
          sqlite_vec_extension_path: indexStatus?.sqlite_vec_extension?.path || runtime.sqliteVecExtensionPath || '',
          sqlite_vec_extension_configured: Boolean(indexStatus?.sqlite_vec_extension?.configured || runtime.sqliteVecExtensionPath),
          sqlite_vec_table_ready: indexStatus?.sqlite_vec_table_ready ?? null,
          index_sweep_interval_minutes: runtime.indexSweepIntervalMinutes
        },
        upgrade_recommended: indexStatus?.upgrade_recommended || false,
        upgrade_reason: indexStatus?.upgrade_reason || null
      },
      updates: updateStatus
    };
  };
}

export function buildUsageGuide() {
  return {
    quickstart: [
      '1. Run localnest_server_status to confirm runtime health and active roots.',
      '2. Use localnest_search_files to find a module, feature, or folder by name.',
      '3. Use localnest_search_code for exact symbols, imports, and error strings.',
      '4. Use localnest_read_file only after narrowing the target.'
    ],
    release_debug: [
      'If retrieval looks empty, validate project_path first, then retry with a broader query.',
      'If runtime looks degraded, inspect server_status.health and updates before deeper debugging.',
      'Use localnest_update_status to see whether cached version data is stale or actionable.'
    ],
    for_users: [
      'Run localnest_list_roots first to verify active roots.',
      'Use localnest_list_projects to discover projects under a root.',
      'Run localnest_index_project for your active project/root before semantic search.',
      'Use localnest_search_hybrid for low-noise retrieval.',
      'Use localnest_read_file for targeted context windows.',
      'Use localnest_task_context for one-call runtime + memory context before non-trivial work.',
      'Use localnest_capture_outcome for one-call outcome capture after meaningful work.',
      'Use localnest_memory_status to verify whether local memory is enabled and supported on this runtime.',
      'Use localnest_memory_capture_event to preserve durable project decisions and preferences after meaningful work.',
      'Use localnest_update_status when you need to verify whether a newer stable version is available.'
    ],
    for_ai_agents: [
      'Call localnest_server_status first to understand runtime capabilities.',
      'Prefer localnest_task_context for non-trivial debugging, implementation, review, and repeated repo work because it bundles runtime status, memory state, and recall in one call.',
      'Treat localnest_capture_outcome as the default post-task memory path after meaningful work when memory is enabled.',
      'To find a module or feature by name (e.g. "SSO", "payments"), use localnest_search_files first because it searches file paths and names.',
      'Use localnest_search_code for exact symbol, keyword, or regex matches in file contents.',
      'Call localnest_index_status, then localnest_index_project when the index is empty or stale.',
      'For acronyms or domain terms (SSO, IAM, CRM), also try synonyms such as oauth, saml, passport, or auth.',
      'Prefer localnest_search_hybrid with project_path for concept-level content retrieval.',
      'If you need lower-level control, call localnest_memory_status only when the task is substantive or memory-specific.',
      'Emit localnest_memory_capture_event only when you need lower-level event control.',
      'Good capture events include: bug fixed, design decision made, review finding confirmed, user preference discovered, or reusable repo workflow learned.',
      'Bad capture events include: browsing files, exploratory reading, dead-end investigation, or trivial one-shot lookups.',
      'Use all_roots only when cross-project lookup is required.',
      'After retrieval, call localnest_read_file with narrow line ranges.',
      'If updates.is_outdated=true in server status, ask user for approval and then call localnest_update_self with approved_by_user=true.'
    ],
    quality_playbook: [
      'Never answer from memory when a LocalNest tool can verify the claim.',
      'For bug/debug tasks: run both localnest_search_code (exact) and localnest_search_hybrid (context).',
      'If results are empty, retry with synonyms and then use localnest_search_code with use_regex=true.',
      'Always cite concrete file paths and line ranges after localnest_read_file before conclusions.'
    ],
    tool_sequence: [
      'localnest_server_status',
      'localnest_list_roots',
      'localnest_list_projects',
      'localnest_search_files -> for module or feature discovery by name',
      'localnest_search_code -> for exact identifiers and errors',
      'localnest_index_status',
      'localnest_index_project',
      'localnest_search_hybrid -> for concept and content retrieval',
      'localnest_read_file',
      'localnest_task_context -> preferred one-call runtime + memory context for substantive tasks',
      'localnest_capture_outcome -> preferred one-call outcome capture after meaningful work',
      'localnest_memory_status -> only when memory is relevant',
      'localnest_memory_recall -> only when memory is enabled and the task is substantive',
      'localnest_memory_capture_event -> after meaningful work',
      'localnest_update_status',
      'localnest_update_self (only after user approval)',
      'localnest_health'
    ],
    recommended_next_action: 'For most sessions: localnest_server_status, then localnest_search_files.'
  };
}
