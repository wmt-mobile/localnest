import test from 'node:test';
import assert from 'node:assert/strict';
import { registerAppTools } from '../src/app/register-tools.js';

/**
 * MCP Tool Annotations Validation Test — Phase 39 (ANNOT-03).
 *
 * Drives the full `registerAppTools()` pipeline against a fake MCP server that
 * captures (name, meta.annotations) for every `registerTool()` call. Compares
 * the captured map against a hardcoded `EXPECTED_ANNOTATIONS` ground-truth map
 * covering all 72 tools (see Plan 02 frontmatter for the full table).
 *
 * This is the authoritative enforcement point for the MCP 2025-06-18 spec
 * annotation semantics across LocalNest. Any drift — a new tool added without
 * annotations, an existing tool's annotation flipped — fails this test with a
 * single assertion listing every mismatch.
 *
 * Category legend:
 *   RO = Read-Only          { readOnlyHint: true,  destructiveHint: false, idempotentHint: true }
 *   WR = additive Write     { readOnlyHint: false, destructiveHint: false, idempotentHint: false }
 *   IW = Idempotent Write   { readOnlyHint: false, destructiveHint: false, idempotentHint: true }
 *   DS = Destructive        { readOnlyHint: false, destructiveHint: true,  idempotentHint: true }
 *
 * openWorldHint is NOT asserted here (explicitly out of scope for Phase 39
 * per 39-CONTEXT.md <decisions>).
 */

// ---------------------------------------------------------------------------
// Fake server — duck-typed clone of test/mcp-tools.test.js:21-29.
// ---------------------------------------------------------------------------
function makeFakeServer() {
  const tools = new Map();
  return {
    tools,
    registerTool(name, meta, _handler) {
      tools.set(name, { meta });
    }
  };
}

// ---------------------------------------------------------------------------
// Fake services — COMPLETE enumeration of every services.* field touched by
// registerAppTools() at REGISTRATION time (not handler time).
//
// Source of truth (verified during Plan 02 Task 1 write-up):
//   - src/app/register-tools.ts:34-123 — 10 registrar calls
//   - src/services/memory/workflow.ts:82-86 — MemoryWorkflowService constructor
//     (no method calls; just field assignment)
//   - src/mcp/common/status.ts:149-200 — createServerStatusBuilder
//     (returns a closure; no construction-time calls)
//   - Every src/mcp/tools/*.ts register function — destructures options
//     and closes over services; no construction-time method invocations.
//
// Every method below is a noop that returns `undefined`. Handlers are never
// invoked by this test — we only care that destructuring + closure capture
// succeed, which requires every field to be PRESENT (not necessarily callable).
// ---------------------------------------------------------------------------
function makeFakeServices() {
  const noopAsync = async () => undefined;

  // memory — union of interfaces from: memory-store.ts, graph-tools.ts,
  // kg-delete-tools.ts, backfill-tools.ts, find-tools.ts, audit-tools.ts,
  // memory-workflow.ts, plus core.ts (server-status uses memory.getStatus).
  const memory = {
    // memory-store.ts MemoryService interface
    listEntries: noopAsync,
    getEntry: noopAsync,
    storeEntry: noopAsync,
    storeEntryBatch: noopAsync,
    updateEntry: noopAsync,
    deleteEntry: noopAsync,
    deleteEntryBatch: noopAsync,
    captureEvent: noopAsync,
    listEvents: noopAsync,
    suggestRelations: noopAsync,
    addRelation: noopAsync,
    removeRelation: noopAsync,
    getRelated: noopAsync,
    // graph-tools.ts MemoryService interface (22 methods)
    addEntity: noopAsync,
    addTriple: noopAsync,
    addEntityBatch: noopAsync,
    addTripleBatch: noopAsync,
    queryEntityRelationships: noopAsync,
    invalidateTriple: noopAsync,
    queryTriplesAsOf: noopAsync,
    getEntityTimeline: noopAsync,
    getKgStats: noopAsync,
    listNests: noopAsync,
    listBranches: noopAsync,
    getTaxonomyTree: noopAsync,
    traverseGraph: noopAsync,
    discoverBridges: noopAsync,
    writeDiaryEntry: noopAsync,
    readDiaryEntries: noopAsync,
    ingestMarkdown: noopAsync,
    ingestJson: noopAsync,
    checkDuplicate: noopAsync,
    backfillMemoryKgLinks: noopAsync,
    store: {
      hooks: {
        // MemoryHooks interface from src/services/memory/hooks.ts — every
        // handler is a noop; getStats used by one tool at handler time only.
        getStats: () => ({ events: 0, workers: 0 }),
        listEvents: () => []
      }
    },
    // kg-delete-tools.ts MemoryService (3 methods)
    deleteEntity: noopAsync,
    deleteEntityBatch: noopAsync,
    deleteTripleBatch: noopAsync,
    // backfill-tools.ts MemoryService (1 method)
    scanAndBackfillProjects: noopAsync,
    // find-tools.ts MemoryServiceForFind
    recall: noopAsync,
    searchTriples: noopAsync,
    // audit-tools.ts MemoryService (1 method)
    audit: noopAsync,
    // memory-workflow.ts MemoryService (core shared)
    getStatus: noopAsync,
    whatsNew: noopAsync
  };

  // workspace — retrieval.ts WorkspaceService + server-status listRoots
  const workspace = {
    listRoots: () => [],
    listProjects: () => [],
    projectTree: () => ({}),
    readFileChunk: noopAsync,
    summarizeProject: () => ({}),
    resolveSearchBases: () => [],
    normalizeTarget: (p) => p,
    roots: []
  };

  // vectorIndex — retrieval.ts VectorIndexService + server-status uses getStatus
  const vectorIndex = {
    getStatus: () => ({
      backend: 'none',
      indexed: 0,
      embedding: { model: 'none', dim: 0 },
      sqlite_vec_loaded: false
    }),
    indexProject: noopAsync
  };

  // search — retrieval.ts SearchService + symbol-tools.ts SymbolSearchService
  //        + find-tools.ts SearchServiceForFind. All share the same `search`
  //        object in register-tools.ts; union all methods here.
  const search = {
    // retrieval.ts SearchService
    searchFiles: () => [],
    searchCode: () => [],
    searchHybrid: noopAsync,
    getSymbol: () => ({}),
    findUsages: () => ({}),
    // symbol-tools.ts SymbolSearchService
    findCallersSymbol: () => ({}),
    findDefinitionSymbol: () => ({}),
    findImplementationsSymbol: () => ({}),
    renamePreviewSymbol: () => ({})
  };

  // updates — core.ts UpdateService interface
  const updates = {
    getStatus: noopAsync,
    getCachedStatus: () => null,
    selfUpdate: noopAsync
  };

  // Top-level services object matches AppServices shape from
  // src/app/create-services.ts (duck-typed — only fields read by
  // register-tools.ts are needed).
  return {
    memory,
    workspace,
    vectorIndex,
    search,
    updates,
    getActiveIndexBackend: () => 'node-sqlite',
    getLastHealthReport: () => null
  };
}

// ---------------------------------------------------------------------------
// EXPECTED_ANNOTATIONS — hardcoded ground truth for all 72 tools.
// Alphabetically sorted so diffs are reviewable. Populated in Task 2.
// ---------------------------------------------------------------------------
const EXPECTED_ANNOTATIONS = {
  // Category legend: RO = read-only; WR = additive non-idempotent write;
  //                  IW = additive idempotent write; DS = destructive.
  // Alphabetically sorted — any drift here fails the test with a diff.
  'localnest_agent_prime':              { readOnlyHint: true,  destructiveHint: false, idempotentHint: true  }, // RO  (fixed Plan 01)
  'localnest_audit':                    { readOnlyHint: true,  destructiveHint: false, idempotentHint: true  }, // RO
  'localnest_capture_outcome':          { readOnlyHint: false, destructiveHint: false, idempotentHint: false }, // WR
  'localnest_diary_read':               { readOnlyHint: true,  destructiveHint: false, idempotentHint: true  }, // RO
  'localnest_diary_write':              { readOnlyHint: false, destructiveHint: false, idempotentHint: false }, // WR
  'localnest_embed_status':             { readOnlyHint: true,  destructiveHint: false, idempotentHint: true  }, // RO  (pure read per retrieval.ts:233-235)
  'localnest_file_changed':             { readOnlyHint: true,  destructiveHint: false, idempotentHint: true  }, // RO
  'localnest_find':                     { readOnlyHint: true,  destructiveHint: false, idempotentHint: true  }, // RO
  'localnest_find_callers':             { readOnlyHint: true,  destructiveHint: false, idempotentHint: true  }, // RO
  'localnest_find_definition':          { readOnlyHint: true,  destructiveHint: false, idempotentHint: true  }, // RO
  'localnest_find_implementations':     { readOnlyHint: true,  destructiveHint: false, idempotentHint: true  }, // RO
  'localnest_find_usages':              { readOnlyHint: true,  destructiveHint: false, idempotentHint: true  }, // RO
  'localnest_get_symbol':               { readOnlyHint: true,  destructiveHint: false, idempotentHint: true  }, // RO
  'localnest_graph_bridges':            { readOnlyHint: true,  destructiveHint: false, idempotentHint: true  }, // RO
  'localnest_graph_traverse':           { readOnlyHint: true,  destructiveHint: false, idempotentHint: true  }, // RO
  'localnest_health':                   { readOnlyHint: true,  destructiveHint: false, idempotentHint: true  }, // RO
  'localnest_help':                     { readOnlyHint: true,  destructiveHint: false, idempotentHint: true  }, // RO
  'localnest_hooks_list_events':        { readOnlyHint: true,  destructiveHint: false, idempotentHint: true  }, // RO
  'localnest_hooks_stats':              { readOnlyHint: true,  destructiveHint: false, idempotentHint: true  }, // RO
  'localnest_index_project':            { readOnlyHint: false, destructiveHint: false, idempotentHint: false }, // WR (builds index; force=true rebuilds)
  'localnest_index_status':             { readOnlyHint: true,  destructiveHint: false, idempotentHint: true  }, // RO
  'localnest_ingest_json':              { readOnlyHint: false, destructiveHint: false, idempotentHint: true  }, // IW (source_label + fingerprint dedup)
  'localnest_ingest_markdown':          { readOnlyHint: false, destructiveHint: false, idempotentHint: true  }, // IW
  'localnest_kg_add_entities_batch':    { readOnlyHint: false, destructiveHint: false, idempotentHint: true  }, // IW (dedups by name)
  'localnest_kg_add_entity':            { readOnlyHint: false, destructiveHint: false, idempotentHint: true  }, // IW
  'localnest_kg_add_triple':            { readOnlyHint: false, destructiveHint: false, idempotentHint: false }, // WR (single: UNCONDITIONAL INSERT in kg.ts:220-224 — intentionally non-idempotent)
  'localnest_kg_add_triples_batch':     { readOnlyHint: false, destructiveHint: false, idempotentHint: true  }, // IW (batch DOES dedup at kg-batch.ts:198-206 — fixed Plan 01)
  'localnest_kg_as_of':                 { readOnlyHint: true,  destructiveHint: false, idempotentHint: true  }, // RO
  'localnest_kg_backfill_links':        { readOnlyHint: false, destructiveHint: false, idempotentHint: true  }, // IW
  'localnest_kg_delete_entities_batch': { readOnlyHint: false, destructiveHint: true,  idempotentHint: true  }, // DS
  'localnest_kg_delete_entity':         { readOnlyHint: false, destructiveHint: true,  idempotentHint: true  }, // DS
  'localnest_kg_delete_triples_batch':  { readOnlyHint: false, destructiveHint: true,  idempotentHint: true  }, // DS
  'localnest_kg_invalidate':            { readOnlyHint: false, destructiveHint: false, idempotentHint: true  }, // IW (sets valid_to; additive)
  'localnest_kg_query':                 { readOnlyHint: true,  destructiveHint: false, idempotentHint: true  }, // RO
  'localnest_kg_stats':                 { readOnlyHint: true,  destructiveHint: false, idempotentHint: true  }, // RO
  'localnest_kg_timeline':              { readOnlyHint: true,  destructiveHint: false, idempotentHint: true  }, // RO
  'localnest_list_projects':            { readOnlyHint: true,  destructiveHint: false, idempotentHint: true  }, // RO
  'localnest_list_roots':               { readOnlyHint: true,  destructiveHint: false, idempotentHint: true  }, // RO
  'localnest_memory_add_relation':      { readOnlyHint: false, destructiveHint: false, idempotentHint: true  }, // IW
  'localnest_memory_capture_event':     { readOnlyHint: false, destructiveHint: false, idempotentHint: false }, // WR
  'localnest_memory_check_duplicate':   { readOnlyHint: true,  destructiveHint: false, idempotentHint: true  }, // RO
  'localnest_memory_delete':            { readOnlyHint: false, destructiveHint: true,  idempotentHint: true  }, // DS
  'localnest_memory_delete_batch':      { readOnlyHint: false, destructiveHint: true,  idempotentHint: true  }, // DS
  'localnest_memory_events':            { readOnlyHint: true,  destructiveHint: false, idempotentHint: true  }, // RO
  'localnest_memory_get':               { readOnlyHint: true,  destructiveHint: false, idempotentHint: true  }, // RO
  'localnest_memory_list':              { readOnlyHint: true,  destructiveHint: false, idempotentHint: true  }, // RO
  'localnest_memory_recall':            { readOnlyHint: true,  destructiveHint: false, idempotentHint: true  }, // RO  (fixed Plan 01)
  'localnest_memory_related':           { readOnlyHint: true,  destructiveHint: false, idempotentHint: true  }, // RO
  'localnest_memory_remove_relation':   { readOnlyHint: false, destructiveHint: true,  idempotentHint: true  }, // DS (Open Q3 — kept destructive: junction row is gone, not invalidated)
  'localnest_memory_status':            { readOnlyHint: true,  destructiveHint: false, idempotentHint: true  }, // RO
  'localnest_memory_store':             { readOnlyHint: false, destructiveHint: false, idempotentHint: false }, // WR
  'localnest_memory_store_batch':       { readOnlyHint: false, destructiveHint: false, idempotentHint: false }, // WR
  'localnest_memory_suggest_relations': { readOnlyHint: true,  destructiveHint: false, idempotentHint: true  }, // RO
  'localnest_memory_update':            { readOnlyHint: false, destructiveHint: false, idempotentHint: false }, // WR (appends revision)
  'localnest_nest_branches':            { readOnlyHint: true,  destructiveHint: false, idempotentHint: true  }, // RO
  'localnest_nest_list':                { readOnlyHint: true,  destructiveHint: false, idempotentHint: true  }, // RO
  'localnest_nest_tree':                { readOnlyHint: true,  destructiveHint: false, idempotentHint: true  }, // RO
  'localnest_project_backfill':         { readOnlyHint: false, destructiveHint: false, idempotentHint: true  }, // IW
  'localnest_project_tree':             { readOnlyHint: true,  destructiveHint: false, idempotentHint: true  }, // RO
  'localnest_read_file':                { readOnlyHint: true,  destructiveHint: false, idempotentHint: true  }, // RO
  'localnest_rename_preview':           { readOnlyHint: true,  destructiveHint: false, idempotentHint: true  }, // RO (dry-run)
  'localnest_search_code':              { readOnlyHint: true,  destructiveHint: false, idempotentHint: true  }, // RO
  'localnest_search_files':             { readOnlyHint: true,  destructiveHint: false, idempotentHint: true  }, // RO
  'localnest_search_hybrid':            { readOnlyHint: true,  destructiveHint: false, idempotentHint: true  }, // RO  (fixed Plan 01)
  'localnest_server_status':            { readOnlyHint: true,  destructiveHint: false, idempotentHint: true  }, // RO
  'localnest_summarize_project':        { readOnlyHint: true,  destructiveHint: false, idempotentHint: true  }, // RO
  'localnest_task_context':             { readOnlyHint: true,  destructiveHint: false, idempotentHint: true  }, // RO  (fixed Plan 01)
  'localnest_teach':                    { readOnlyHint: false, destructiveHint: false, idempotentHint: false }, // WR
  'localnest_update_self':              { readOnlyHint: false, destructiveHint: true,  idempotentHint: true  }, // DS  (fixed Plan 01)
  'localnest_update_status':            { readOnlyHint: true,  destructiveHint: false, idempotentHint: true  }, // RO
  'localnest_usage_guide':              { readOnlyHint: true,  destructiveHint: false, idempotentHint: true  }, // RO
  'localnest_whats_new':                { readOnlyHint: true,  destructiveHint: false, idempotentHint: true  }  // RO  (fixed Plan 01)
};

// ---------------------------------------------------------------------------
// Test
// ---------------------------------------------------------------------------
test('mcp-annotations: all 72 tools match expected readOnly/destructive/idempotent hints', () => {
  const server = makeFakeServer();
  const fakeRuntime = {
    mcpMode: 'stdio',
    hasRipgrep: false,
    autoProjectSplit: false,
    maxAutoProjects: 0,
    forceSplitChildren: false,
    rgTimeoutMs: 0,
    indexBackend: 'none',
    vectorIndexPath: '/tmp/fake.idx'
  };
  const fakeServices = makeFakeServices();

  registerAppTools(server, fakeRuntime, fakeServices);

  const registered = Array.from(server.tools.keys()).sort();
  const expected = Object.keys(EXPECTED_ANNOTATIONS).sort();

  // 1. Registered tool set matches expected set
  const unregistered = expected.filter((n) => !registered.includes(n));
  const unexpected = registered.filter((n) => !expected.includes(n));
  assert.deepEqual(
    unregistered,
    [],
    `Tools in EXPECTED_ANNOTATIONS but not registered: ${unregistered.join(', ')}`
  );
  assert.deepEqual(
    unexpected,
    [],
    `Tools registered but missing from EXPECTED_ANNOTATIONS: ${unexpected.join(', ')}`
  );

  // 2. Collect-all-mismatches — one failure message lists every drift
  const mismatches = [];
  for (const name of expected) {
    const { meta } = server.tools.get(name);
    const actual = meta.annotations || {};
    const want = EXPECTED_ANNOTATIONS[name];
    for (const key of ['readOnlyHint', 'destructiveHint', 'idempotentHint']) {
      if (actual[key] !== want[key]) {
        mismatches.push(`${name}.${key}: expected ${want[key]}, got ${actual[key]}`);
      }
    }
  }
  assert.equal(
    mismatches.length,
    0,
    `Annotation mismatches (${mismatches.length} total):\n  ${mismatches.join('\n  ')}`
  );
});
