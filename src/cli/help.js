/**
 * Premium CLI help renderer for LocalNest.
 *
 * Uses raw ANSI escape codes — no chalk dependency.
 * Respects NO_COLOR and FORCE_COLOR environment variables.
 * Inspired by Vercel, Railway, and Supabase CLI aesthetics.
 *
 * @module src/cli/help
 */

import { SERVER_VERSION } from '../runtime/version.js';

/* ------------------------------------------------------------------ */
/*  ANSI helpers                                                       */
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
const ITALIC = `${ESC}3m`;
const CYAN = `${ESC}36m`;
const GREEN = `${ESC}32m`;
const YELLOW = `${ESC}33m`;
const MAGENTA = `${ESC}35m`;
const BLUE = `${ESC}34m`;
const GRAY = `${ESC}90m`;
const BG_BLUE = `${ESC}44m`;
const WHITE = `${ESC}37m`;

function c(code, text) {
  return useColor() ? `${code}${text}${RESET}` : text;
}

function bold(t) { return c(BOLD, t); }
function dim(t) { return c(DIM, t); }
function cyan(t) { return c(CYAN, t); }
function green(t) { return c(GREEN, t); }
function yellow(t) { return c(YELLOW, t); }
function magenta(t) { return c(MAGENTA, t); }
function blue(t) { return c(BLUE, t); }
function gray(t) { return c(GRAY, t); }
function italic(t) { return c(ITALIC, t); }
function badge(t) { return c(`${BG_BLUE}${WHITE}${BOLD}`, ` ${t} `); }

/* ------------------------------------------------------------------ */
/*  Box drawing                                                        */
/* ------------------------------------------------------------------ */

const BOX = {
  tl: '╭', tr: '╮', bl: '╰', br: '╯',
  h: '─', v: '│',
  dot: '●', arrow: '→', check: '✓',
};

function boxLine(content, width = 60) {
  // eslint-disable-next-line no-control-regex
  const visible = content.replace(/\x1b\[[0-9;]*m/g, '');
  const pad = Math.max(0, width - visible.length - 4);
  return `  ${gray(BOX.v)} ${content}${' '.repeat(pad)} ${gray(BOX.v)}`;
}

function boxTop(width = 60) {
  return `  ${gray(BOX.tl + BOX.h.repeat(width - 2) + BOX.tr)}`;
}

function boxBottom(width = 60) {
  return `  ${gray(BOX.bl + BOX.h.repeat(width - 2) + BOX.br)}`;
}

function separator() {
  return `  ${gray(BOX.h.repeat(60))}`;
}

/* ------------------------------------------------------------------ */
/*  Command definitions by category                                    */
/* ------------------------------------------------------------------ */

const CATEGORIES = [
  {
    name: 'Core',
    icon: BOX.dot,
    color: green,
    commands: [
      { name: 'start', alias: 'serve', desc: 'Start MCP server (stdio)' },
      { name: 'setup', desc: 'Run interactive setup wizard' },
      { name: 'upgrade', desc: 'Upgrade package and sync config' },
      { name: 'doctor', desc: 'Run health diagnostics' },
      { name: 'version', desc: 'Print version' },
    ],
  },
  {
    name: 'Memory',
    icon: '◆',
    color: cyan,
    commands: [
      { name: 'memory add', desc: 'Store a memory entry' },
      { name: 'memory search', desc: 'Search memories by query' },
      { name: 'memory list', desc: 'List stored memories' },
      { name: 'memory show', desc: 'View one memory with revisions' },
      { name: 'memory delete', desc: 'Remove a memory entry' },
    ],
  },
  {
    name: 'Knowledge Graph',
    icon: '◇',
    color: magenta,
    commands: [
      { name: 'kg add', desc: 'Create a subject→predicate→object triple' },
      { name: 'kg query', desc: 'Query entity relationships' },
      { name: 'kg timeline', desc: 'Show fact evolution over time' },
      { name: 'kg stats', desc: 'Entity/triple/predicate breakdown' },
    ],
  },
  {
    name: 'Organization',
    icon: '▸',
    color: yellow,
    commands: [
      { name: 'skill install', alias: 'install skills', desc: 'Install skills to AI clients' },
      { name: 'skill list', desc: 'Show installed skills' },
      { name: 'skill remove', desc: 'Uninstall a skill' },
      { name: 'hooks install', desc: 'Wire memory hooks into Claude Code' },
      { name: 'hooks status', desc: 'Check installed hook status' },
    ],
  },
  {
    name: 'Tools',
    icon: '⚡',
    color: blue,
    commands: [
      { name: 'mcp start', desc: 'Start MCP server' },
      { name: 'mcp status', desc: 'Server health and config' },
      { name: 'mcp config', desc: 'Output MCP config JSON' },
      { name: 'ingest', desc: 'Import a conversation file' },
      { name: 'completion', desc: 'Generate shell completions' },
      { name: 'task-context', desc: 'Retrieve runtime + memory context' },
      { name: 'capture-outcome', desc: 'Save a task outcome to memory' },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Print the main help text with premium visual design.
 */
export function printHelp() {
  const W = 60;
  const lines = [];

  lines.push('');
  lines.push(boxTop(W));
  lines.push(boxLine(`${bold('LocalNest')}  ${gray(`v${SERVER_VERSION}`)}  ${badge('MCP')}`, W));
  lines.push(boxLine(`${italic(gray('Local-first AI memory, code retrieval & knowledge graph'))}`, W));
  lines.push(boxLine('', W));
  lines.push(boxLine(`${green(BOX.check)} ${dim('52 MCP tools')}  ${cyan(BOX.dot)} ${dim('Zero cloud deps')}  ${magenta('◇')} ${dim('Temporal KG')}`, W));
  lines.push(boxBottom(W));
  lines.push('');

  lines.push(`  ${bold('USAGE')}  ${gray('localnest <command> [options]')}`);
  lines.push('');

  for (const cat of CATEGORIES) {
    const header = `${cat.color(cat.icon)} ${bold(cat.color(cat.name))}`;
    lines.push(`  ${header}`);

    for (const cmd of cat.commands) {
      const cmdName = cat.color(cmd.name);
      const visible = cmd.name;
      const pad = Math.max(2, 26 - visible.length);
      const aliasStr = cmd.alias ? gray(` (${cmd.alias})`) : '';
      lines.push(`    ${cmdName}${' '.repeat(pad)}${dim(cmd.desc)}${aliasStr}`);
    }
    lines.push('');
  }

  lines.push(separator());
  lines.push('');
  lines.push(`  ${bold('FLAGS')}`);
  lines.push(`    ${green('--json')}                ${dim('Machine-readable JSON output')}`);
  lines.push(`    ${green('--verbose')}             ${dim('Increase output detail')}`);
  lines.push(`    ${green('--quiet')}               ${dim('Suppress non-essential output')}`);
  lines.push(`    ${green('--config')} ${gray('<path>')}       ${dim('Custom config file path')}`);
  lines.push(`    ${green('--version')}, ${green('-v')}        ${dim('Print version')}`);
  lines.push(`    ${green('--help')}, ${green('-h')}           ${dim('Show this help')}`);
  lines.push('');

  lines.push(separator());
  lines.push('');
  lines.push(`  ${gray('Quick start:')}  ${cyan('localnest setup')} ${gray(BOX.arrow)} ${cyan('localnest doctor')} ${gray(BOX.arrow)} ${cyan('localnest hooks install')}`);
  lines.push(`  ${gray('Docs:')}         ${blue('https://wmt-mobile.github.io/localnest/')}`);
  lines.push('');

  process.stdout.write(lines.join('\n') + '\n');
}

/**
 * Print help for a specific noun subcommand.
 */
export function printSubcommandHelp(noun, verbs) {
  const lines = [];
  lines.push('');
  lines.push(`  ${bold(cyan('localnest ' + noun))} ${gray('<command> [options]')}`);
  lines.push('');
  for (const v of verbs) {
    const nameStr = cyan(v.name);
    const visible = v.name;
    const pad = Math.max(2, 26 - visible.length);
    lines.push(`    ${nameStr}${' '.repeat(pad)}${dim(v.desc)}`);
  }
  lines.push('');
  process.stdout.write(lines.join('\n') + '\n');
}
