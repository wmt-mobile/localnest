import type { RuntimeConfig, RootEntry } from '../../runtime/config.js';
import type { NormalizedMemoryStatus } from './response-normalizers.js';

interface MemoryGuidance {
  enabled: boolean;
  auto_capture: boolean;
  consent_done: boolean;
  backend_available: boolean;
  requested_backend: string | null;
  selected_backend: string | null;
  total_entries: number;
  total_events: number;
  guidance: string[];
}

function buildMemoryGuidance(status: NormalizedMemoryStatus): string[] {
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

function buildMemorySummary(status: NormalizedMemoryStatus): MemoryGuidance {
  return {
    enabled: status.enabled,
    auto_capture: status.auto_capture,
    consent_done: status.consent_done,
    backend_available: status.backend?.available || false,
    requested_backend: status.backend?.requested || status.requested_backend || null,
    selected_backend: status.backend?.selected || null,
    total_entries: status.store?.total_entries || 0,
    total_events: status.store?.total_events || 0,
    guidance: buildMemoryGuidance(status)
  };
}

interface HealthSummaryInput {
  runtime: RuntimeConfig;
  memoryStatus: NormalizedMemoryStatus;
  indexStatus: IndexStatusLike | null;
  activeIndexBackend: string | null;
}

interface IndexStatusLike {
  sqlite_vec_extension?: {
    configured?: boolean;
    loaded?: boolean;
    path?: string;
  };
  sqlite_vec_loaded?: boolean;
  sqlite_vec_table_ready?: boolean;
  error?: string;
  upgrade_recommended?: boolean;
  upgrade_reason?: string | null;
  [key: string]: unknown;
}

interface HealthSummary {
  overall: string;
  vector_index_ready: boolean;
  sqlite_vec_native_ready: boolean;
  memory_ready: boolean;
  has_ripgrep: boolean;
  issues: string[];
  recommended_next_action: string;
}

function buildHealthSummary({ runtime, memoryStatus, indexStatus, activeIndexBackend }: HealthSummaryInput): HealthSummary {
  const memoryAvailable = Boolean(memoryStatus?.enabled && memoryStatus?.backend?.available);
  const vectorReady = Boolean(activeIndexBackend && indexStatus);
  const sqliteVecNativeReady = activeIndexBackend !== 'sqlite-vec'
    || Boolean(indexStatus?.sqlite_vec_extension?.configured && indexStatus?.sqlite_vec_loaded && indexStatus?.sqlite_vec_table_ready);
  const issues: string[] = [];

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

interface MemoryService {
  getStatus(): Promise<NormalizedMemoryStatus>;
}

interface UpdateService {
  getCachedStatus?(): unknown;
  getStatus(opts: { force: boolean }): Promise<unknown>;
}

interface WorkspaceService {
  listRoots(): RootEntry[];
}

interface VectorIndexService {
  getStatus?(): IndexStatusLike | null;
}

export interface ServerStatusBuilderOptions {
  serverName: string;
  serverVersion: string;
  runtime: RuntimeConfig;
  workspace: WorkspaceService;
  memory: MemoryService;
  updates: UpdateService;
  getActiveIndexBackend: () => string | null;
  vectorIndex: VectorIndexService;
}

export interface ServerStatus {
  name: string;
  version: string;
  mode: string;
  roots: RootEntry[];
  has_ripgrep: boolean;
  health: HealthSummary;
  memory: MemoryGuidance;
  search: {
    auto_project_split: boolean;
    max_auto_projects: number;
    force_split_children: boolean;
    rg_timeout_ms: number;
  };
  vector_index: Record<string, unknown>;
  updates: unknown;
  [key: string]: unknown;
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
}: ServerStatusBuilderOptions): () => Promise<ServerStatus> {
  return async function buildServerStatus(): Promise<ServerStatus> {
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

export interface UsageGuide {
  quickstart: string[];
  release_debug: string[];
  for_users: string[];
  for_ai_agents: string[];
  quality_playbook: string[];
  tool_sequence: string[];
  recommended_next_action: string;
}

export interface HelpGuideTool {
  name: string;
  description: string;
  example?: Record<string, unknown>;
}

export interface HelpGuide {
  task_type: string;
  tools: HelpGuideTool[];
  workflow: string[];
  tip: string;
}

interface TaskRule {
  pattern: RegExp;
  type: string;
  tools: HelpGuideTool[];
  workflow: string[];
  tip: string;
}

/* eslint-disable @typescript-eslint/no-unused-vars -- data table */
const t = (name: string, description: string, example?: Record<string, unknown>): HelpGuideTool => ({ name, description, ...(example ? { example } : {}) });
const HELP_RULES: TaskRule[] = [
  { pattern: /\b(store|save|remember|capture|log|record|preserve|decision|outcome)\b/i, type: 'memory_capture',
    tools: [t('localnest_memory_store', 'Store a durable memory entry', { title: 'Auth uses JWT', content: 'Decided to use JWT with refresh tokens' }),
      t('localnest_capture_outcome', 'One-call outcome capture after meaningful work'),
      t('localnest_memory_suggest_relations', 'Find related memories to link after storing')],
    workflow: ['1. Call memory_store with title + content (all other fields auto-inferred).', '2. Note the returned memory ID.', '3. Optionally call memory_suggest_relations to discover related prior knowledge.', '4. Link strong matches (>= 0.7) with memory_add_relation.'],
    tip: 'After bug fixes, decisions, or review findings, always capture -- it costs nothing and pays compound interest.' },
  { pattern: /\b(recall|find memory|what did|remember when|prior|previous|history|context)\b/i, type: 'memory_recall',
    tools: [t('localnest_task_context', 'One-call runtime + memory context (preferred start)'),
      t('localnest_memory_recall', 'Search memories by query with semantic ranking'),
      t('localnest_memory_related', 'Traverse memory graph one hop from a known entry')],
    workflow: ['1. Call task_context with a task_hint for bundled status + recall.', '2. If you need deeper recall, use memory_recall with a focused query.', '3. Follow up with memory_related on the most relevant result.'],
    tip: 'Use task_context as your default entry point -- it bundles runtime status and memory recall in one call.' },
  { pattern: /\b(search code|find function|symbol|import|identifier|definition|usage)\b/i, type: 'code_search',
    tools: [t('localnest_search_code', 'Exact symbol/keyword/regex search in file contents'),
      t('localnest_search_files', 'Find files by name/path pattern'),
      t('localnest_read_file', 'Read exact lines from a known file')],
    workflow: ['1. Use search_code for exact symbol matches.', '2. Use search_files to locate the module/file by name.', '3. Read targeted line ranges with read_file.'],
    tip: 'Pass project_path when known -- scoped searches are 10x faster than root-wide.' },
  { pattern: /\b(search|find|where is|locate|discover|module|feature|folder)\b/i, type: 'content_search',
    tools: [t('localnest_search_files', 'Find files by name/path pattern'),
      t('localnest_search_hybrid', 'Concept-level content retrieval (lexical + semantic)'),
      t('localnest_project_tree', 'Directory structure overview')],
    workflow: ['1. Start with search_files for module/directory discovery.', '2. Use search_hybrid for concept-level or fuzzy matches.', '3. Use project_tree for structural overview.'],
    tip: 'For acronyms (SSO, IAM), also try synonyms (oauth, saml, passport, auth).' },
  { pattern: /\b(graph|entity|triple|fact|knowledge graph|kg|structured fact)\b/i, type: 'knowledge_graph',
    tools: [t('localnest_kg_add_entity', 'Create named entities (people, projects, concepts)'),
      t('localnest_kg_add_triple', 'Add subject-predicate-object facts'),
      t('localnest_kg_query', 'Query relationships for an entity'),
      t('localnest_kg_stats', 'Entity/triple counts and predicate breakdown')],
    workflow: ['1. Create entities with kg_add_entity.', '2. Link them with kg_add_triple (subject-predicate-object).', '3. Query relationships with kg_query.', '4. Use kg_timeline for chronological fact evolution.'],
    tip: 'When facts change, invalidate the old triple with kg_invalidate and add the new one.' },
  { pattern: /\b(relate|link|connect|suggest|similar|associated)\b/i, type: 'memory_relations',
    tools: [t('localnest_memory_suggest_relations', 'Find semantically similar memories'),
      t('localnest_memory_add_relation', 'Link two memories with a named relation'),
      t('localnest_memory_related', 'Traverse memory links one hop')],
    workflow: ['1. Call memory_suggest_relations on a memory ID.', '2. Review candidates (similarity >= 0.55).', '3. Confirm with memory_add_relation using an appropriate relation_type.', '4. Use memory_related to verify the graph.'],
    tip: 'Relation types: related, depends_on, contradicts, supersedes, extends.' },
  { pattern: /\b(debug|fix|investigate|error|crash|broken|failing|bug|issue|traceback)\b/i, type: 'debug',
    tools: [t('localnest_task_context', 'Check prior fixes/context before diving in'),
      t('localnest_search_code', 'Search for error strings and symbols'),
      t('localnest_search_hybrid', 'Search for architectural context'),
      t('localnest_read_file', 'Read exact code for confirmation'),
      t('localnest_capture_outcome', 'Capture the fix for future reference')],
    workflow: ['1. Call task_context for prior fixes and context.', '2. Search for the error with search_code (exact match).', '3. Search for architecture with search_hybrid (concept match).', '4. Read targeted lines with read_file.', '5. After fixing, capture the outcome.'],
    tip: 'Run both search_code (exact) and search_hybrid (context) for thorough investigation.' },
  { pattern: /\b(setup|install|configure|onboard|getting started)\b/i, type: 'setup',
    tools: [t('localnest_server_status', 'Check runtime health and configuration'),
      t('localnest_health', 'Compact health smoke check'),
      t('localnest_usage_guide', 'Best-practice guidance from the server')],
    workflow: ['1. Run server_status to check runtime health.', '2. If issues, run health for a compact diagnostic.', '3. Call usage_guide for embedded best practices.'],
    tip: 'Most setup issues are resolved by: npm install -g localnest-mcp && localnest setup && localnest doctor.' },
  { pattern: /\b(nest|branch|organize|taxonomy|hierarchy|tree)\b/i, type: 'taxonomy',
    tools: [t('localnest_nest_tree', 'Full hierarchy view: nests -> branches -> counts'),
      t('localnest_nest_list', 'List top-level nests with counts'),
      t('localnest_nest_branches', 'List branches within a specific nest')],
    workflow: ['1. Run nest_tree for the full overview.', '2. Use nest_branches to drill into a specific nest.', '3. Pass nest/branch params when storing memories for organized retrieval.'],
    tip: 'Nests are auto-inferred from project_path. Branches from git branch or topic.' },
];

export function buildHelpGuide(task: string): HelpGuide {
  if (!task || !task.trim()) {
    return {
      task_type: 'general',
      tools: [
        { name: 'localnest_server_status', description: 'Check runtime health' },
        { name: 'localnest_usage_guide', description: 'Best-practice guidance' },
        { name: 'localnest_search_files', description: 'Find files by name' },
      ],
      workflow: [
        '1. Run server_status to confirm the runtime is healthy.',
        '2. Call usage_guide for workflow guidance.',
        '3. Start searching with search_files.',
      ],
      tip: 'Call localnest_help with a specific task description for tailored guidance.',
    };
  }

  for (const rule of HELP_RULES) {
    if (rule.pattern.test(task)) {
      return {
        task_type: rule.type,
        tools: rule.tools,
        workflow: rule.workflow,
        tip: rule.tip,
      };
    }
  }

  return {
    task_type: 'general',
    tools: [
      { name: 'localnest_server_status', description: 'Check runtime health' },
      { name: 'localnest_search_files', description: 'Find files by name' },
      { name: 'localnest_search_hybrid', description: 'Concept-level content retrieval' },
    ],
    workflow: [
      '1. Run server_status to check runtime capabilities.',
      '2. Use search_files for module/file discovery.',
      '3. Use search_hybrid for concept-level search.',
    ],
    tip: 'Describe your task more specifically for better guidance (e.g. "debug auth crash", "store a decision").',
  };
}

export function buildUsageGuide(): UsageGuide {
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
