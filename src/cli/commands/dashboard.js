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

/* -- ANSI helpers ---------------------------------------------------- */

function useColor() {
  if (process.env.NO_COLOR !== undefined) return false;
  if (process.env.FORCE_COLOR !== undefined) return true;
  return process.stdout.isTTY === true;
}

const ESC = '\x1b[';
const RESET = `${ESC}0m`;
const BOLD = `${ESC}1m`;
const DIM = `${ESC}2m`;
const CYAN = `${ESC}36m`;
const GREEN = `${ESC}32m`;
const YELLOW = `${ESC}33m`;
const MAGENTA = `${ESC}35m`;
const RED = `${ESC}31m`;
const GRAY = `${ESC}90m`;
const INVERSE = `${ESC}7m`;

function c(code, text) { return useColor() ? `${code}${text}${RESET}` : text; }
function bold(t) { return c(BOLD, t); }
function dim(t) { return c(DIM, t); }
function cyan(t) { return c(CYAN, t); }
function green(t) { return c(GREEN, t); }
function yellow(t) { return c(YELLOW, t); }
function magenta(t) { return c(MAGENTA, t); }
function red(t) { return c(RED, t); }
function gray(t) { return c(GRAY, t); }
function inverse(t) { return c(INVERSE, t); }

/* -- Box drawing + layout ------------------------------------------- */

const B = {
  tl: '\u256d', tr: '\u256e', bl: '\u2570', br: '\u256f',
  h: '\u2500', v: '\u2502',
  stl: '\u250c', str: '\u2510', sbl: '\u2514', sbr: '\u2518',
  full: '\u2588', light: '\u2591',
};

// eslint-disable-next-line no-control-regex
function visLen(s) { return s.replace(/\x1b\[[0-9;]*m/g, '').length; }
function padRight(s, w) { const d = w - visLen(s); return d > 0 ? s + ' '.repeat(d) : s; }

function panel(title, rows, width, titleColor = cyan) {
  const inner = width - 4;
  const titleStr = ` ${titleColor(title)} `;
  const titleVis = visLen(titleStr);
  const top = B.stl + B.h + titleStr + B.h.repeat(Math.max(0, width - 3 - titleVis)) + B.str;
  const lines = [`  ${gray(top)}`];
  for (const row of rows) lines.push(`  ${gray(B.v)} ${padRight(row, inner)} ${gray(B.v)}`);
  lines.push(`  ${gray(B.sbl + B.h.repeat(width - 2) + B.sbr)}`);
  return lines;
}

function progressBar(ratio, barWidth = 20) {
  const filled = Math.round(ratio * barWidth);
  return green(B.full.repeat(filled)) + gray(B.light.repeat(barWidth - filled));
}

/* -- Helpers --------------------------------------------------------- */

function timeAgo(iso) {
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

function truncate(s, max) { return !s ? '' : s.length > max ? s.slice(0, max - 3) + '...' : s; }

function timestamp() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
}

/* -- Service bootstrap ----------------------------------------------- */

function createMemoryService() {
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
      embeddingService,
    }),
    runtime,
  };
}

/* -- Data collection ------------------------------------------------- */

async function collectData(svc) {
  const data = { status: null, recentEntries: null, allEntries: null, kgStats: null, nests: null, hookStats: null };
  try { data.status = await svc.getStatus(); } catch { data.status = { enabled: false, store: { initialized: false } }; }
  if (!svc.enabled) return data;

  const results = await Promise.allSettled([
    svc.listEntries({ limit: 50, status: undefined }),
    svc.getKgStats(),
    svc.listNests(),
  ]);

  data.allEntries = results[0].status === 'fulfilled' ? results[0].value : null;
  data.recentEntries = data.allEntries;
  data.kgStats = results[1].status === 'fulfilled' ? results[1].value : null;
  data.nests = results[2].status === 'fulfilled' ? results[2].value : null;
  try { data.hookStats = svc.store?.hooks?.getStats?.() || null; } catch { data.hookStats = null; }
  return data;
}

/* -- View renderers -------------------------------------------------- */

const VIEWS = { OVERVIEW: 'overview', MEMORY: 'memory', KG: 'kg', RECENT: 'recent', HELP: 'help' };

function renderHeader(W, view, refreshing) {
  const title = bold('LocalNest Dashboard');
  const ver = dim(`v${SERVER_VERSION}`);
  const refreshLabel = refreshing ? green('refreshing...') : dim(`\u21bb every 5s`);
  const meta = `${ver}  ${gray(B.v)}  ${dim('52 tools')}  ${gray(B.v)}  ${refreshLabel}`;
  const content = `${title}  ${gray(B.v)}  ${meta}`;
  return [
    `  ${gray(B.tl + B.h.repeat(W - 2) + B.tr)}`,
    `  ${gray(B.v)} ${padRight(content, W - 4)} ${gray(B.v)}`,
    `  ${gray(B.bl + B.h.repeat(W - 2) + B.br)}`,
    '',
  ];
}

function renderDisabled(W) {
  return panel('Status', [red('Memory is not enabled.'), '', `Run ${cyan('localnest setup')} to enable.`], W, red);
}

function renderStatsRow(data, W) {
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
  const merged = [];
  for (let i = 0; i < maxL; i++) {
    const left = memP[i] || ' '.repeat(halfW + 2);
    const right = (kgP[i] || '').replace(/^ {2}/, '');
    merged.push(`${padRight(left, halfW + 2)}${right}`);
  }
  return merged;
}

function renderServerRow(data, W) {
  const st = data.status || {};
  const store = st.store || {};
  const backend = st.backend || {};
  const hookCount = data.hookStats?.total_listeners ?? 0;
  const statusStr = store.initialized ? green('Running') : red('Stopped');
  const backendStr = backend.selected || dim('none');
  const indexStr = store.initialized ? green('Fresh') : dim('N/A');
  const rows = [
    `${dim('Status:')} ${statusStr}  ${gray(B.v)}  ${dim('Backend:')} ${bold(backendStr)}  ${gray(B.v)}  ${dim('Index:')} ${indexStr}`,
    `${dim('Memory:')} ${st.enabled ? green('Enabled') : red('Disabled')}  ${gray(B.v)}  ${dim('Hooks:')} ${bold(String(hookCount))}  ${gray(B.v)}  ${dim('Tools:')} ${bold('52')}`,
  ];
  return panel('Server', rows, W, green);
}

function renderNests(data, W) {
  const nests = data.nests?.nests || [];
  if (!nests.length) return panel('Nests', [dim('No nests created yet.')], W, yellow);
  const total = nests.reduce((s, n) => s + n.count, 0) || 1;
  const rows = [];
  for (const nest of nests.slice(0, 6)) {
    const ratio = nest.count / total;
    rows.push(`${yellow(padRight(nest.nest, 14))} ${progressBar(ratio, 20)}  ${dim(String(nest.count) + ' entries')} ${dim(`(${Math.round(ratio * 100)}%)`)}`);
  }
  if (nests.length > 6) rows.push(dim(`  ... and ${nests.length - 6} more`));
  return panel('Nests', rows, W, yellow);
}

function renderRecentShort(data, W) {
  const entries = data.recentEntries?.items?.slice(0, 5) || [];
  if (!entries.length) return panel('Recent Memories', [dim('No memories stored yet.')], W, cyan);
  const rows = entries.map(e => {
    const ago = padRight(timeAgo(e.updated_at), 7);
    const kind = padRight(e.kind || 'unknown', 12);
    return `${dim(ago)} ${yellow(kind)} ${cyan(truncate(e.title || e.summary || '', W - 32))}`;
  });
  return panel('Recent Memories', rows, W, cyan);
}

function renderFooter(W, view) {
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

function renderStatusBar(view, lastRefresh, W) {
  const viewName = bold(view.charAt(0).toUpperCase() + view.slice(1));
  const ts = dim(`Last refresh: ${lastRefresh}`);
  const content = `  ${viewName}  ${gray(B.v)}  ${ts}`;
  return [gray('  ' + B.h.repeat(W - 2)), content];
}

function renderOverview(data, W) {
  if (!data.status?.enabled) return renderDisabled(W);
  const lines = [];
  lines.push(...renderStatsRow(data, W), '');
  lines.push(...renderServerRow(data, W), '');
  lines.push(...renderNests(data, W), '');
  lines.push(...renderRecentShort(data, W));
  return lines;
}

function renderMemoryDetail(data, W) {
  const entries = data.allEntries?.items || [];
  if (!entries.length) return panel('Memory Entries', [dim('No memory entries found.')], W, cyan);
  const rows = [
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

function renderKgDetail(data, W) {
  const kg = data.kgStats || {};
  const preds = Array.isArray(kg.by_predicate) ? kg.by_predicate : [];
  const summaryRows = [
    `${dim('Entities:')}      ${bold(String(kg.entities ?? 0))}`,
    `${dim('Total triples:')} ${bold(String(kg.triples ?? 0))}`,
    `${dim('Active:')}        ${bold(String(kg.active_triples ?? 0))}`,
    `${dim('Predicates:')}    ${bold(String(preds.length))}`,
  ];
  const lines = [...panel('Knowledge Graph Summary', summaryRows, W, magenta), ''];

  if (preds.length) {
    const predRows = [
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

function renderRecentDetail(data, W) {
  const entries = data.recentEntries?.items || [];
  if (!entries.length) return panel('Recent Memories', [dim('No memories stored yet.')], W, cyan);
  const rows = [];
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

function renderHelp(W) {
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

function renderJson(data) {
  const st = data.status || {};
  const store = st.store || {};
  const kg = data.kgStats || {};
  const nests = data.nests?.nests || [];
  const entries = (data.recentEntries?.items || []).map(e => ({
    id: e.id, kind: e.kind, title: e.title, updated_at: e.updated_at,
  }));
  process.stdout.write(JSON.stringify({
    version: SERVER_VERSION,
    memory: { enabled: st.enabled ?? false, entries: store.total_entries ?? 0, events: store.total_events ?? 0, relations: store.total_relations ?? 0, backend: st.backend?.selected || null },
    knowledge_graph: { entities: kg.entities ?? 0, triples: kg.triples ?? 0, active_triples: kg.active_triples ?? 0, predicates: Array.isArray(kg.by_predicate) ? kg.by_predicate.length : 0 },
    nests: nests.map(n => ({ name: n.nest, count: n.count })),
    recent_memories: entries,
    hooks: data.hookStats?.total_listeners ?? 0,
  }, null, 2) + '\n');
}

/* -- Static fallback (non-TTY) --------------------------------------- */

function renderStatic(data) {
  const W = 68;
  const lines = ['', ...renderHeader(W, VIEWS.OVERVIEW, false), ...renderOverview(data, W), ''];
  process.stdout.write(lines.join('\n') + '\n');
}

/* -- Interactive TUI ------------------------------------------------- */

async function runInteractive(svc) {
  let view = VIEWS.OVERVIEW;
  let data = await collectData(svc);
  let lastRefresh = timestamp();
  let refreshing = false;
  let running = true;

  const W = Math.min(Math.max(process.stdout.columns || 68, 60), 100);

  function clearScreen() { process.stdout.write('\x1b[2J\x1b[H\x1b[?25l'); }
  function showCursor() { process.stdout.write('\x1b[?25h'); }

  function render() {
    clearScreen();
    const lines = [];
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

  async function refresh() {
    refreshing = true;
    render();
    try { data = await collectData(svc); } catch { /* keep stale data */ }
    lastRefresh = timestamp();
    refreshing = false;
    if (running) render();
  }

  function cleanup() {
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

  process.stdin.on('data', (key) => {
    if (!running) return;
    // Ctrl+C
    if (key === '\x03') { cleanup(); process.exit(0); }
    switch (key.toLowerCase()) {
      case 'q':  cleanup(); process.exit(0); break;
      case 'r':  refresh(); break;
      case '0':  // fall through
      case 'h':  view = VIEWS.OVERVIEW; render(); break;
      case '1':  view = VIEWS.MEMORY;   render(); break;
      case '2':  view = VIEWS.KG;       render(); break;
      case '3':  view = VIEWS.RECENT;   render(); break;
      case '?':  view = view === VIEWS.HELP ? VIEWS.OVERVIEW : VIEWS.HELP; render(); break;
    }
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

/** @param {string[]} args  @param {import('../options.js').GlobalOptions} opts */
export async function run(args, opts) {
  const isJson = opts.json || args.includes('--json');

  let svc;
  try {
    ({ svc } = createMemoryService());
  } catch (err) {
    if (isJson) {
      process.stdout.write(JSON.stringify({ error: err.message }, null, 2) + '\n');
    } else {
      process.stderr.write(`Error: ${err.message}\n`);
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
