/**
 * Interactive TUI Dashboard for LocalNest.
 * Keys: q quit, r refresh, 1 Memory, 2 KG, 3 Recent, 0/h Overview, ? help
 * Falls back to static render when stdout is not a TTY. --json for machine output.
 * @module src/cli/commands/dashboard
 */

import { SERVER_VERSION } from '../../runtime/version.js';
import { buildRuntimeConfig } from '../../runtime/config.js';
import { EmbeddingService } from '../../services/retrieval/embedding/service.js';
import { MemoryService } from '../../services/memory/service.js';
import {
  bold, dim, cyan, green, yellow, magenta, red, gray, inverse,
  B, padRight, panel, progressBar, truncate,
} from '../ansi.js';
import { writeError } from '../output.js';
import { TOOL_COUNT } from '../tool-count.js';
import type { GlobalOptions } from '../options.js';

/* -- Helpers --------------------------------------------------------- */

function timeAgo(iso: string | null | undefined): string {
  if (!iso) return '     ';
  const diff = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diff)) return '     ';
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now  ';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function timestamp(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
}

/* -- Service bootstrap ----------------------------------------------- */

function createMemoryService(): { svc: MemoryService; runtime: any } {
  const runtime = buildRuntimeConfig();
  const embeddingService = new EmbeddingService({
    provider: runtime.embeddingProvider,
    model: runtime.embeddingModel,
    cacheDir: runtime.embeddingCacheDir,
  });
  return {
    svc: new MemoryService({
      localnestHome: runtime.localnestHome,
      enabled: runtime.memoryEnabled,
      backend: runtime.memoryBackend,
      dbPath: runtime.memoryDbPath,
      autoCapture: runtime.memoryAutoCapture,
      consentDone: runtime.memoryConsentDone,
      embeddingService: embeddingService as any,
    }),
    runtime,
  };
}

/* -- Data collection ------------------------------------------------- */

interface DashboardData {
  status: any;
  recentEntries: any;
  allEntries: any;
  kgStats: any;
  nests: any;
  hookStats: any;
}

async function collectData(svc: MemoryService): Promise<DashboardData> {
  const data: DashboardData = { status: null, recentEntries: null, allEntries: null, kgStats: null, nests: null, hookStats: null };
  try { data.status = await svc.getStatus(); } catch { data.status = { enabled: false, store: { initialized: false } }; }
  if (!(svc as any).enabled) return data;

  const results = await Promise.allSettled([
    svc.listEntries({ limit: 50, status: undefined }),
    svc.getKgStats(),
    svc.listNests(),
  ]);

  data.allEntries = results[0].status === 'fulfilled' ? results[0].value : null;
  data.recentEntries = data.allEntries;
  data.kgStats = results[1].status === 'fulfilled' ? results[1].value : null;
  data.nests = results[2].status === 'fulfilled' ? results[2].value : null;
  try { data.hookStats = (svc as any).store?.hooks?.getStats?.() || null; } catch { data.hookStats = null; }
  return data;
}

/* -- View renderers -------------------------------------------------- */

const VIEWS = { OVERVIEW: 'overview', MEMORY: 'memory', KG: 'kg', RECENT: 'recent', HELP: 'help' } as const;
type ViewKey = typeof VIEWS[keyof typeof VIEWS];

function renderHeader(W: number, _view: ViewKey, refreshing: boolean): string[] {
  const title = bold('LocalNest Dashboard');
  const ver = dim(`v${SERVER_VERSION}`);
  const refreshLabel = refreshing ? green('refreshing...') : dim(`\u21bb every 5s`);
  const meta = `${ver}  ${gray(B.v)}  ${dim(`${TOOL_COUNT} tools`)}  ${gray(B.v)}  ${refreshLabel}`;
  const content = `${title}  ${gray(B.v)}  ${meta}`;
  return [
    `  ${gray(B.tl + B.h.repeat(W - 2) + B.tr)}`,
    `  ${gray(B.v)} ${padRight(content, W - 4)} ${gray(B.v)}`,
    `  ${gray(B.bl + B.h.repeat(W - 2) + B.br)}`,
    '',
  ];
}

function renderDisabled(W: number): string[] {
  return panel('Status', [red('Memory is not enabled.'), '', `Run ${cyan('localnest setup')} to enable.`], W, red);
}

function renderStatsRow(data: DashboardData, W: number): string[] {
  const halfW = Math.floor((W - 2) / 2);
  const st = data.status?.store || {};
  const kg = data.kgStats || {};
  const memRows = [
    `${dim('Entries:')}    ${bold(String(st.total_entries ?? 0))}`,
    `${dim('Active:')}     ${bold(String(st.total_entries ?? 0))}`,
    `${dim('Events:')}     ${bold(String(st.total_events ?? 0))}`,
    `${dim('Relations:')}  ${bold(String(st.total_relations ?? 0))}`,
  ];
  const predCount = Array.isArray(kg.by_predicate) ? kg.by_predicate.length : 0;
  const kgRows = [
    `${dim('Entities:')}   ${bold(String(kg.entities ?? 0))}`,
    `${dim('Triples:')}    ${bold(String(kg.triples ?? 0))}`,
    `${dim('Active:')}     ${bold(String(kg.active_triples ?? 0))}`,
    `${dim('Predicates:')} ${bold(String(predCount))}`,
  ];
  const memP = panel('Memory', memRows, halfW, cyan);
  const kgP = panel('Knowledge Graph', kgRows, halfW, magenta);
  const maxL = Math.max(memP.length, kgP.length);
  const merged: string[] = [];
  for (let i = 0; i < maxL; i++) {
    const left = memP[i] || ' '.repeat(halfW + 2);
    const right = (kgP[i] || '').replace(/^ {2}/, '');
    merged.push(`${padRight(left, halfW + 2)}${right}`);
  }
  return merged;
}

function renderServerRow(data: DashboardData, W: number): string[] {
  const st = data.status || {};
  const store = st.store || {};
  const backend = st.backend || {};
  const hookCount = data.hookStats?.total_listeners ?? 0;
  const statusStr = store.initialized ? green('Running') : red('Stopped');
  const backendStr = backend.selected || dim('none');
  const indexStr = store.initialized ? green('Fresh') : dim('N/A');
  const rows = [
    `${dim('Status:')} ${statusStr}  ${gray(B.v)}  ${dim('Backend:')} ${bold(backendStr)}  ${gray(B.v)}  ${dim('Index:')} ${indexStr}`,
    `${dim('Memory:')} ${st.enabled ? green('Enabled') : red('Disabled')}  ${gray(B.v)}  ${dim('Hooks:')} ${bold(String(hookCount))}  ${gray(B.v)}  ${dim('Tools:')} ${bold(String(TOOL_COUNT))}`,
  ];
  return panel('Server', rows, W, green);
}

function renderNests(data: DashboardData, W: number): string[] {
  const nests = data.nests?.nests || [];
  if (!nests.length) return panel('Nests', [dim('No nests created yet.')], W, yellow);
  const total = nests.reduce((s: number, n: any) => s + n.count, 0) || 1;
  const rows: string[] = [];
  for (const nest of nests.slice(0, 6)) {
    const ratio = nest.count / total;
    rows.push(`${yellow(padRight(nest.nest, 14))} ${progressBar(ratio, 20)}  ${dim(String(nest.count) + ' entries')} ${dim(`(${Math.round(ratio * 100)}%)`)}`);
  }
  if (nests.length > 6) rows.push(dim(`  ... and ${nests.length - 6} more`));
  return panel('Nests', rows, W, yellow);
}

function renderRecentShort(data: DashboardData, W: number): string[] {
  const entries = data.recentEntries?.items?.slice(0, 5) || [];
  if (!entries.length) return panel('Recent Memories', [dim('No memories stored yet.')], W, cyan);
  const rows = entries.map((e: any) => {
    const ago = padRight(timeAgo(e.updated_at), 7);
    const kind = padRight(e.kind || 'unknown', 12);
    return `${dim(ago)} ${yellow(kind)} ${cyan(truncate(e.title || e.summary || '', W - 32))}`;
  });
  return panel('Recent Memories', rows, W, cyan);
}

function renderFooter(W: number, view: ViewKey): string[] {
  const keys = [
    view === VIEWS.OVERVIEW ? inverse(' 0 Overview ') : dim('[0] Overview'),
    view === VIEWS.MEMORY ? inverse(' 1 Memory ') : dim('[1] Memory'),
    view === VIEWS.KG ? inverse(' 2 KG ') : dim('[2] KG'),
    view === VIEWS.RECENT ? inverse(' 3 Recent ') : dim('[3] Recent'),
    dim('[r] Refresh'),
    dim('[?] Help'),
    dim('[q] Quit'),
  ];
  return [`  ${keys.join('  ')}`, ''];
}

function renderStatusBar(view: ViewKey, lastRefresh: string, _W: number): string[] {
  const viewName = bold(view.charAt(0).toUpperCase() + view.slice(1));
  const ts = dim(`Last refresh: ${lastRefresh}`);
  const content = `  ${viewName}  ${gray(B.v)}  ${ts}`;
  return [gray('  ' + B.h.repeat(_W - 2)), content];
}

function renderOverview(data: DashboardData, W: number): string[] {
  if (!data.status?.enabled) return renderDisabled(W);
  const lines: string[] = [];
  lines.push(...renderStatsRow(data, W), '');
  lines.push(...renderServerRow(data, W), '');
  lines.push(...renderNests(data, W), '');
  lines.push(...renderRecentShort(data, W));
  return lines;
}

function renderMemoryDetail(data: DashboardData, W: number): string[] {
  const entries = data.allEntries?.items || [];
  if (!entries.length) return panel('Memory Entries', [dim('No memory entries found.')], W, cyan);
  const rows: string[] = [
    `${bold(padRight('ID', 8))} ${bold(padRight('Kind', 12))} ${bold(padRight('Imp', 4))} ${bold('Title')}`,
    gray(B.h.repeat(W - 6)),
  ];
  const maxShow = Math.min(entries.length, 30);
  for (let i = 0; i < maxShow; i++) {
    const e = entries[i];
    const id = padRight(truncate(e.id || '', 7), 8);
    const kind = padRight(e.kind || '?', 12);
    const imp = padRight(String(e.importance ?? '-'), 4);
    const title = truncate(e.title || e.summary || '', W - 34);
    rows.push(`${dim(id)} ${yellow(kind)} ${cyan(imp)} ${title}`);
  }
  if (entries.length > maxShow) rows.push(dim(`  ... ${entries.length - maxShow} more entries`));
  return panel('Memory Entries (detail)', rows, W, cyan);
}

function renderKgDetail(data: DashboardData, W: number): string[] {
  const kg = data.kgStats || {};
  const preds = Array.isArray(kg.by_predicate) ? kg.by_predicate : [];
  const summaryRows = [
    `${dim('Entities:')}      ${bold(String(kg.entities ?? 0))}`,
    `${dim('Total triples:')} ${bold(String(kg.triples ?? 0))}`,
    `${dim('Active:')}        ${bold(String(kg.active_triples ?? 0))}`,
    `${dim('Predicates:')}    ${bold(String(preds.length))}`,
  ];
  const lines: string[] = [...panel('Knowledge Graph Summary', summaryRows, W, magenta), ''];

  if (preds.length) {
    const predRows: string[] = [
      `${bold(padRight('Predicate', 30))} ${bold('Count')}`,
      gray(B.h.repeat(W - 6)),
    ];
    for (const p of preds.slice(0, 20)) {
      predRows.push(`${magenta(padRight(p.predicate || '?', 30))} ${bold(String(p.count))}`);
    }
    if (preds.length > 20) predRows.push(dim(`  ... ${preds.length - 20} more`));
    lines.push(...panel('Predicate Breakdown', predRows, W, magenta));
  } else {
    lines.push(...panel('Predicate Breakdown', [dim('No predicates yet.')], W, magenta));
  }
  return lines;
}

function renderRecentDetail(data: DashboardData, W: number): string[] {
  const entries = data.recentEntries?.items || [];
  if (!entries.length) return panel('Recent Memories', [dim('No memories stored yet.')], W, cyan);
  const rows: string[] = [];
  const maxShow = Math.min(entries.length, 25);
  for (let i = 0; i < maxShow; i++) {
    const e = entries[i];
    const ago = padRight(timeAgo(e.updated_at), 8);
    const kind = padRight(e.kind || 'unknown', 12);
    const title = truncate(e.title || e.summary || '', W - 30);
    rows.push(`${dim(ago)} ${yellow(kind)} ${cyan(title)}`);
  }
  if (entries.length > maxShow) rows.push(dim(`  ... ${entries.length - maxShow} more`));
  return panel('Recent Memories (all)', rows, W, cyan);
}

function renderHelp(W: number): string[] {
  const rows = [
    `${bold(cyan('Key'))}       ${bold('Action')}`,
    gray(B.h.repeat(W - 6)),
    `${cyan('0')} / ${cyan('h')}     Return to main overview`,
    `${cyan('1')}         Memory detail panel`,
    `${cyan('2')}         Knowledge Graph detail panel`,
    `${cyan('3')}         Recent memories list`,
    `${cyan('r')}         Force refresh data`,
    `${cyan('?')}         Toggle this help overlay`,
    `${cyan('q')}         Quit dashboard`,
    `${cyan('Ctrl+C')}    Quit dashboard`,
    '',
    dim('Dashboard auto-refreshes every 5 seconds.'),
    dim('All data is read-only from your local memory store.'),
  ];
  return panel('Help', rows, W, cyan);
}

/* -- JSON output ----------------------------------------------------- */

function renderJson(data: DashboardData): void {
  const st = data.status || {};
  const store = st.store || {};
  const kg = data.kgStats || {};
  const nests = data.nests?.nests || [];
  const entries = (data.recentEntries?.items || []).map((e: any) => ({
    id: e.id, kind: e.kind, title: e.title, updated_at: e.updated_at,
  }));
  process.stdout.write(JSON.stringify({
    version: SERVER_VERSION,
    memory: { enabled: st.enabled ?? false, entries: store.total_entries ?? 0, events: store.total_events ?? 0, relations: store.total_relations ?? 0, backend: st.backend?.selected || null },
    knowledge_graph: { entities: kg.entities ?? 0, triples: kg.triples ?? 0, active_triples: kg.active_triples ?? 0, predicates: Array.isArray(kg.by_predicate) ? kg.by_predicate.length : 0 },
    nests: nests.map((n: any) => ({ name: n.nest, count: n.count })),
    recent_memories: entries,
    hooks: data.hookStats?.total_listeners ?? 0,
  }, null, 2) + '\n');
}

/* -- Static fallback (non-TTY) --------------------------------------- */

function renderStatic(data: DashboardData): void {
  const W = 68;
  const lines = ['', ...renderHeader(W, VIEWS.OVERVIEW, false), ...renderOverview(data, W), ''];
  process.stdout.write(lines.join('\n') + '\n');
}

/* -- Interactive TUI ------------------------------------------------- */

async function runInteractive(svc: MemoryService): Promise<void> {
  let view: ViewKey = VIEWS.OVERVIEW;
  let data = await collectData(svc);
  let lastRefresh = timestamp();
  let refreshing = false;
  let running = true;

  const W = Math.min(Math.max(process.stdout.columns || 68, 60), 100);

  function clearScreen(): void { process.stdout.write('\x1b[2J\x1b[H\x1b[?25l'); }
  function showCursor(): void { process.stdout.write('\x1b[?25h'); }

  function render(): void {
    clearScreen();
    const lines: string[] = [];
    lines.push(...renderHeader(W, view, refreshing));

    switch (view) {
      case VIEWS.OVERVIEW: lines.push(...renderOverview(data, W)); break;
      case VIEWS.MEMORY:   lines.push(...renderMemoryDetail(data, W)); break;
      case VIEWS.KG:       lines.push(...renderKgDetail(data, W)); break;
      case VIEWS.RECENT:   lines.push(...renderRecentDetail(data, W)); break;
      case VIEWS.HELP:     lines.push(...renderHelp(W)); break;
    }

    lines.push('');
    lines.push(...renderStatusBar(view, lastRefresh, W));
    lines.push(...renderFooter(W, view));
    process.stdout.write(lines.join('\n') + '\n');
  }

  let refreshLock = false;
  async function refresh(): Promise<void> {
    if (refreshLock) return;
    refreshLock = true;
    refreshing = true;
    render();
    try { data = await collectData(svc); } catch { /* keep stale data */ }
    lastRefresh = timestamp();
    refreshing = false;
    refreshLock = false;
    if (running) render();
  }

  function cleanup(): void {
    running = false;
    clearInterval(autoRefresh);
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
      process.stdin.pause();
    }
    showCursor();
    process.stdout.write('\x1b[2J\x1b[H');
    process.stdout.write(dim('Dashboard closed.') + '\n');
  }

  // Set up raw-mode keyboard input
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
  }

  process.stdin.on('data', (key: string) => {
    if (!running) return;
    // Ctrl+C
    if (key === '\x03') { cleanup(); process.exit(0); }
    const k = key.toLowerCase();
    if (k === 'q') { cleanup(); process.exit(0); return; }
    if (k === 'r') { refresh(); return; }
    // View switches
    const viewMap: Record<string, ViewKey> = { '0': VIEWS.OVERVIEW, h: VIEWS.OVERVIEW, '1': VIEWS.MEMORY, '2': VIEWS.KG, '3': VIEWS.RECENT };
    if (k === '?') {
      view = view === VIEWS.HELP ? VIEWS.OVERVIEW : VIEWS.HELP;
    } else if (viewMap[k]) {
      view = viewMap[k];
    } else {
      return; // unrecognized key
    }
    if (!refreshLock) render();
  });

  // Handle SIGINT gracefully
  process.on('SIGINT', () => { cleanup(); process.exit(0); });
  process.on('SIGTERM', () => { cleanup(); process.exit(0); });

  // Auto-refresh every 5 seconds
  const autoRefresh = setInterval(() => { if (running) refresh(); }, 5000);

  // Initial render
  render();
}

/* -- Public API ------------------------------------------------------ */

export async function run(args: string[], opts: GlobalOptions): Promise<void> {
  const isJson = opts.json || args.includes('--json');

  let svc: MemoryService;
  try {
    ({ svc } = createMemoryService());
  } catch (err: unknown) {
    if (isJson) {
      process.stdout.write(JSON.stringify({ error: (err as Error).message }, null, 2) + '\n');
    } else {
      writeError((err as Error).message);
    }
    process.exitCode = 1;
    return;
  }

  if (isJson) {
    const data = await collectData(svc);
    renderJson(data);
    return;
  }

  // Non-TTY: static one-shot render
  if (!process.stdout.isTTY) {
    const data = await collectData(svc);
    renderStatic(data);
    return;
  }

  // Interactive TUI
  await runInteractive(svc);
}
