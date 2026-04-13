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
  // PLACEHOLDER — Task 2 fills in all 72 entries
  'localnest_audit': { readOnlyHint: true, destructiveHint: false, idempotentHint: true }
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
