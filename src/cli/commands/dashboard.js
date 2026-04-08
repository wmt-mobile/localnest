/**
 * Dashboard CLI command for LocalNest.
 *
 *   localnest dashboard [--json]
 *
 * Prints a static, beautifully formatted terminal dashboard showing
 * memory stats, knowledge graph overview, nests, recent memories,
 * and server status. Zero new dependencies.
 *
 * @module src/cli/commands/dashboard
 */

import { SERVER_VERSION } from '../../runtime/version.js';
import { buildRuntimeConfig } from '../../runtime/config.js';
import { EmbeddingService } from '../../services/retrieval/embedding/service.js';
import { MemoryService } from '../../services/memory/service.js';

/* ------------------------------------------------------------------ */
/*  ANSI helpers (mirrors src/cli/help.js)                             */
/* ------------------------------------------------------------------ */

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
// const WHITE = `${ESC}37m`;
// const BG_CYAN = `${ESC}46m`;
// const BG_RED = `${ESC}41m`;

function c(code, text) {
  return useColor() ? `${code}${text}${RESET}` : text;
}

function bold(t) { return c(BOLD, t); }
function dim(t) { return c(DIM, t); }
function cyan(t) { return c(CYAN, t); }
function green(t) { return c(GREEN, t); }
function yellow(t) { return c(YELLOW, t); }
function magenta(t) { return c(MAGENTA, t); }
function red(t) { return c(RED, t); }
function gray(t) { return c(GRAY, t); }

/* ------------------------------------------------------------------ */
/*  Box drawing                                                        */
/* ------------------------------------------------------------------ */

const B = {
  tl: '\u256d', tr: '\u256e', bl: '\u2570', br: '\u256f',
  h: '\u2500', v: '\u2502',
  stl: '\u250c', str: '\u2510', sbl: '\u2514', sbr: '\u2518',
  full: '\u2588', light: '\u2591',
};

/** Strip ANSI escape codes to get visible character length. */
// eslint-disable-next-line no-control-regex
function visLen(s) { return s.replace(/\x1b\[[0-9;]*m/g, '').length; }

function padRight(s, w) {
  const diff = w - visLen(s);
  return diff > 0 ? s + ' '.repeat(diff) : s;
}

/* ------------------------------------------------------------------ */
/*  Panel renderer                                                     */
/* ------------------------------------------------------------------ */

/**
 * Render a bordered panel with a title.
 *
 * @param {string}   title   Panel title
 * @param {string[]} rows    Content rows (already coloured)
 * @param {number}   width   Total outer width (including borders)
 * @param {Function} titleColor  Colour function for title
 * @returns {string[]} Array of rendered lines
 */
function panel(title, rows, width, titleColor = cyan) {
  const inner = width - 4;                     // 2 border + 2 padding
  const titleStr = ` ${titleColor(title)} `;
  const titleVis = visLen(titleStr);
  const topRule = B.stl + B.h + titleStr + B.h.repeat(Math.max(0, width - 3 - titleVis)) + B.str;

  const lines = [];
  lines.push(`  ${gray(topRule)}`);
  for (const row of rows) {
    lines.push(`  ${gray(B.v)} ${padRight(row, inner)} ${gray(B.v)}`);
  }
  lines.push(`  ${gray(B.sbl + B.h.repeat(width - 2) + B.sbr)}`);
  return lines;
}

/* ------------------------------------------------------------------ */
/*  Progress bar                                                       */
/* ------------------------------------------------------------------ */

function progressBar(ratio, barWidth = 20) {
  const filled = Math.round(ratio * barWidth);
  const empty = barWidth - filled;
  return green(B.full.repeat(filled)) + gray(B.light.repeat(empty));
}

/* ------------------------------------------------------------------ */
/*  Time-ago helper                                                    */
/* ------------------------------------------------------------------ */

function timeAgo(iso) {
  if (!iso) return '     ';
  const now = Date.now();
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '     ';
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'now  ';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function truncate(str, max) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max - 3) + '...' : str;
}

/* ------------------------------------------------------------------ */
/*  Service bootstrap (same as memory.js)                              */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Data collectors                                                    */
/* ------------------------------------------------------------------ */

async function collectData(svc) {
  const data = {
    status: null,
    entries: null,
    kgStats: null,
    nests: null,
    hookStats: null,
    recentEntries: null,
  };

  try {
    data.status = await svc.getStatus();
  } catch {
    data.status = { enabled: false, store: { initialized: false } };
  }

  if (!svc.enabled) return data;

  const results = await Promise.allSettled([
    svc.listEntries({ limit: 5, status: undefined }),
    svc.getKgStats(),
    svc.listNests(),
  ]);

  data.recentEntries = results[0].status === 'fulfilled' ? results[0].value : null;
  data.kgStats = results[1].status === 'fulfilled' ? results[1].value : null;
  data.nests = results[2].status === 'fulfilled' ? results[2].value : null;

  // Hook stats come from the store's hooks instance
  try {
    data.hookStats = svc.store?.hooks?.getStats?.() || null;
  } catch {
    data.hookStats = null;
  }

  return data;
}

/* ------------------------------------------------------------------ */
/*  Render: header                                                     */
/* ------------------------------------------------------------------ */

function renderHeader(W) {
  const title = bold('LocalNest Dashboard');
  const ver = dim(`v${SERVER_VERSION}`);
  const content = `${title}${' '.repeat(Math.max(1, W - 4 - visLen(title) - visLen(ver)))}${ver}`;
  return [
    '',
    `  ${gray(B.tl + B.h.repeat(W - 2) + B.tr)}`,
    `  ${gray(B.v)} ${padRight(content, W - 4)} ${gray(B.v)}`,
    `  ${gray(B.bl + B.h.repeat(W - 2) + B.br)}`,
    '',
  ];
}

/* ------------------------------------------------------------------ */
/*  Render: memory disabled fallback                                   */
/* ------------------------------------------------------------------ */

function renderDisabled(W) {
  const rows = [
    `${red('Memory is not enabled.')}`,
    '',
    `Run ${cyan('localnest setup')} to enable local memory.`,
  ];
  return panel('Status', rows, W, red);
}

/* ------------------------------------------------------------------ */
/*  Render: memory + KG side-by-side                                   */
/* ------------------------------------------------------------------ */

function renderStatsRow(data, W) {
  const halfW = Math.floor((W - 2) / 2);
  const status = data.status;
  const store = status?.store || {};
  const kg = data.kgStats || {};

  const memRows = [
    `${dim('Entries:')}    ${bold(String(store.total_entries ?? 0))}`,
    `${dim('Active:')}     ${bold(String(store.total_entries ?? 0))}`,
    `${dim('Events:')}     ${bold(String(store.total_events ?? 0))}`,
    `${dim('Relations:')}  ${bold(String(store.total_relations ?? 0))}`,
  ];
  const memPanel = panel('Memory', memRows, halfW, cyan);

  const predicateCount = Array.isArray(kg.by_predicate) ? kg.by_predicate.length : 0;
  const kgRows = [
    `${dim('Entities:')}   ${bold(String(kg.entities ?? 0))}`,
    `${dim('Triples:')}    ${bold(String(kg.triples ?? 0))}`,
    `${dim('Active:')}     ${bold(String(kg.active_triples ?? 0))}`,
    `${dim('Predicates:')} ${bold(String(predicateCount))}`,
  ];
  const kgPanel = panel('Knowledge Graph', kgRows, halfW, magenta);

  // Merge side-by-side
  const maxLines = Math.max(memPanel.length, kgPanel.length);
  const emptyMem = ' '.repeat(halfW + 2);
  const emptyKg = '';
  const merged = [];
  for (let i = 0; i < maxLines; i++) {
    const left = memPanel[i] || emptyMem;
    const right = kgPanel[i] || emptyKg;
    // Strip the leading 2-space indent from the right panel so they sit together
    const rightTrimmed = right.replace(/^ {2}/, '');
    merged.push(`${padRight(left, halfW + 2)}${rightTrimmed}`);
  }
  return merged;
}

/* ------------------------------------------------------------------ */
/*  Render: nests panel                                                */
/* ------------------------------------------------------------------ */

function renderNests(data, W) {
  const nests = data.nests?.nests || [];
  if (nests.length === 0) {
    return panel('Nests', [dim('No nests created yet.')], W, yellow);
  }

  const totalEntries = nests.reduce((s, n) => s + n.count, 0) || 1;
  const rows = [];
  const maxDisplay = 6;
  const shown = nests.slice(0, maxDisplay);

  for (const nest of shown) {
    const ratio = nest.count / totalEntries;
    const pct = Math.round(ratio * 100);
    const nameStr = padRight(nest.nest, 14);
    const countStr = dim(`(${nest.count} entries)`);
    const bar = progressBar(ratio, 20);
    rows.push(`${yellow(nameStr)} ${countStr}  ${bar}  ${dim(String(pct) + '%')}`);
  }

  if (nests.length > maxDisplay) {
    rows.push(dim(`  ... and ${nests.length - maxDisplay} more`));
  }

  return panel('Nests', rows, W, yellow);
}

/* ------------------------------------------------------------------ */
/*  Render: recent memories panel                                      */
/* ------------------------------------------------------------------ */

function renderRecentMemories(data, W) {
  const entries = data.recentEntries?.items || [];
  if (entries.length === 0) {
    return panel('Recent Memories', [dim('No memories stored yet.')], W, cyan);
  }

  const rows = [];
  for (const entry of entries) {
    const ago = padRight(timeAgo(entry.updated_at), 7);
    const kind = padRight(entry.kind || 'unknown', 12);
    const title = truncate(entry.title || entry.summary || '', W - 32);
    rows.push(`${dim(ago)} ${yellow(kind)} ${cyan('"' + title + '"')}`);
  }

  return panel('Recent Memories', rows, W, cyan);
}

/* ------------------------------------------------------------------ */
/*  Render: server panel                                               */
/* ------------------------------------------------------------------ */

function renderServer(data, W) {
  const status = data.status || {};
  const store = status.store || {};
  const backend = status.backend || {};
  const hookCount = data.hookStats?.total_listeners ?? 0;
  const isRunning = store.initialized;

  const statusStr = isRunning ? green('Running') : red('Stopped');
  const memStr = status.enabled ? green('Enabled') : red('Disabled');
  const backendStr = backend.selected || dim('none');
  const indexStr = store.initialized ? green('Fresh') : dim('N/A');

  const row1 = `${dim('Status:')} ${statusStr}  ${gray(B.v)}  ${dim('Tools:')} ${bold('52')}  ${gray(B.v)}  ${dim('Backend:')} ${bold(backendStr)}`;
  const row2 = `${dim('Memory:')} ${memStr}  ${gray(B.v)}  ${dim('Hooks:')} ${bold(String(hookCount))}  ${gray(B.v)}  ${dim('Index:')}   ${indexStr}`;

  return panel('Server', [row1, row2], W, green);
}

/* ------------------------------------------------------------------ */
/*  JSON output                                                        */
/* ------------------------------------------------------------------ */

function renderJson(data) {
  const status = data.status || {};
  const store = status.store || {};
  const kg = data.kgStats || {};
  const nests = data.nests?.nests || [];
  const entries = (data.recentEntries?.items || []).map(e => ({
    id: e.id,
    kind: e.kind,
    title: e.title,
    updated_at: e.updated_at,
  }));

  const output = {
    version: SERVER_VERSION,
    memory: {
      enabled: status.enabled ?? false,
      entries: store.total_entries ?? 0,
      events: store.total_events ?? 0,
      relations: store.total_relations ?? 0,
      backend: status.backend?.selected || null,
    },
    knowledge_graph: {
      entities: kg.entities ?? 0,
      triples: kg.triples ?? 0,
      active_triples: kg.active_triples ?? 0,
      predicates: Array.isArray(kg.by_predicate) ? kg.by_predicate.length : 0,
    },
    nests: nests.map(n => ({ name: n.nest, count: n.count })),
    recent_memories: entries,
    hooks: data.hookStats?.total_listeners ?? 0,
  };

  process.stdout.write(JSON.stringify(output, null, 2) + '\n');
}

/* ------------------------------------------------------------------ */
/*  Main render                                                        */
/* ------------------------------------------------------------------ */

function render(data) {
  const W = 60;
  const lines = [];

  lines.push(...renderHeader(W));

  if (!data.status?.enabled) {
    lines.push(...renderDisabled(W));
    lines.push('');
    process.stdout.write(lines.join('\n') + '\n');
    return;
  }

  lines.push(...renderStatsRow(data, W));
  lines.push('');
  lines.push(...renderNests(data, W));
  lines.push('');
  lines.push(...renderRecentMemories(data, W));
  lines.push('');
  lines.push(...renderServer(data, W));
  lines.push('');

  process.stdout.write(lines.join('\n') + '\n');
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * @param {string[]} args
 * @param {import('../options.js').GlobalOptions} opts
 */
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

  const data = await collectData(svc);

  if (isJson) {
    renderJson(data);
  } else {
    render(data);
  }
}
