/**
 * Colored help text renderer for LocalNest CLI.
 *
 * Uses raw ANSI escape codes -- no chalk dependency.
 * Respects NO_COLOR and FORCE_COLOR environment variables.
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
const CYAN = `${ESC}36m`;
const GREEN = `${ESC}32m`;
const YELLOW = `${ESC}33m`;
const MAGENTA = `${ESC}35m`;
const BLUE = `${ESC}34m`;

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

/* ------------------------------------------------------------------ */
/*  Command definitions by category                                    */
/* ------------------------------------------------------------------ */

const CATEGORIES = [
  {
    name: 'Core',
    color: green,
    commands: [
      { name: 'start', alias: 'serve', desc: 'Start MCP server (stdio)' },
      { name: 'setup', alias: null, desc: 'Run setup wizard' },
      { name: 'upgrade', alias: null, desc: 'Upgrade package and migrate setup' },
      { name: 'version', alias: null, desc: 'Print version' },
    ],
  },
  {
    name: 'Memory',
    color: cyan,
    commands: [
      { name: 'memory add', alias: null, desc: 'Store a memory entry' },
      { name: 'memory search', alias: null, desc: 'Search memories by query' },
      { name: 'memory list', alias: null, desc: 'List stored memories' },
      { name: 'memory show', alias: null, desc: 'Show a single memory by ID' },
      { name: 'memory delete', alias: null, desc: 'Delete a memory by ID' },
    ],
  },
  {
    name: 'Knowledge Graph',
    color: magenta,
    commands: [
      { name: 'kg add', alias: null, desc: 'Create a triple' },
      { name: 'kg query', alias: null, desc: 'Query entity relationships' },
      { name: 'kg timeline', alias: null, desc: 'Show entity fact timeline' },
      { name: 'kg stats', alias: null, desc: 'Show graph statistics' },
    ],
  },
  {
    name: 'Skills',
    color: yellow,
    commands: [
      { name: 'skill install', alias: 'install skills', desc: 'Install bundled skills' },
      { name: 'skill list', alias: null, desc: 'List installed skills' },
      { name: 'skill remove', alias: null, desc: 'Remove a skill' },
    ],
  },
  {
    name: 'Diagnostics',
    color: blue,
    commands: [
      { name: 'doctor', alias: null, desc: 'Run diagnostics' },
      { name: 'mcp start', alias: null, desc: 'Start MCP server' },
      { name: 'mcp status', alias: null, desc: 'Show MCP server status' },
      { name: 'mcp config', alias: null, desc: 'Output MCP client config JSON' },
      { name: 'ingest', alias: null, desc: 'Ingest a conversation file' },
      { name: 'completion', alias: null, desc: 'Generate shell completion script' },
      { name: 'task-context', alias: null, desc: 'Print runtime + recalled context' },
      { name: 'capture-outcome', alias: null, desc: 'Persist a task outcome' },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Print the main help text with colored command categories.
 */
export function printHelp() {
  const lines = [];

  lines.push('');
  lines.push(`  ${bold('LocalNest')} ${dim(`v${SERVER_VERSION}`)}`);
  lines.push(`  ${dim('Local-first AI memory & retrieval')}`);
  lines.push('');
  lines.push(`  ${bold('USAGE')}`)
  lines.push(`    localnest ${dim('<command>')} ${dim('[options]')}`);
  lines.push('');

  for (const cat of CATEGORIES) {
    lines.push(`  ${bold(cat.color(cat.name))}`);
    for (const cmd of cat.commands) {
      const nameStr = `    ${cmd.name}`;
      const pad = Math.max(2, 28 - nameStr.length);
      const aliasStr = cmd.alias ? dim(` (alias: ${cmd.alias})`) : '';
      lines.push(`${nameStr}${' '.repeat(pad)}${dim(cmd.desc)}${aliasStr}`);
    }
    lines.push('');
  }

  lines.push(`  ${bold('GLOBAL FLAGS')}`);
  lines.push(`    --json                  ${dim('Output in JSON format')}`);
  lines.push(`    --verbose               ${dim('Increase output detail')}`);
  lines.push(`    --quiet                 ${dim('Suppress non-essential output')}`);
  lines.push(`    --config ${dim('<path>')}         ${dim('Use custom config file')}`);
  lines.push(`    --version, -v           ${dim('Print version')}`);
  lines.push(`    --help, -h              ${dim('Show this help')}`);
  lines.push('');

  process.stdout.write(lines.join('\n') + '\n');
}

/**
 * Print help for a specific noun subcommand.
 *
 * @param {string} noun - The noun command (e.g. 'memory', 'kg')
 * @param {{ name: string, desc: string }[]} verbs - Available verbs
 */
export function printSubcommandHelp(noun, verbs) {
  const lines = [];
  lines.push('');
  lines.push(`  ${bold('localnest ' + noun)} ${dim('<command>')} ${dim('[options]')}`);
  lines.push('');
  for (const v of verbs) {
    const nameStr = `    ${v.name}`;
    const pad = Math.max(2, 28 - nameStr.length);
    lines.push(`${nameStr}${' '.repeat(pad)}${dim(v.desc)}`);
  }
  lines.push('');
  process.stdout.write(lines.join('\n') + '\n');
}
