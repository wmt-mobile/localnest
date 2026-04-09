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
import {
  bold, dim, italic, cyan, green, yellow, magenta, blue, gray, badge,
  B as BOX, boxTop, boxBottom, boxLine, separator,
} from './ansi.js';
import { TOOL_COUNT } from './tool-count.js';

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
      { name: 'onboard', desc: 'Guided first-run experience' },
      { name: 'upgrade', desc: 'Upgrade package and sync config' },
      { name: 'doctor', desc: 'Run health diagnostics' },
      { name: 'selftest', desc: 'End-to-end pipeline validation' },
      { name: 'dashboard', desc: 'Show memory & KG overview' },
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
  lines.push(`  ${bold('LocalNest')} ${cyan(`v${SERVER_VERSION}`)} ${gray(BOX.h.repeat(2))} ${dim('local-first MCP memory server')}`);
  lines.push('');
  lines.push(boxTop(W));
  lines.push(boxLine(`${bold('LocalNest')}  ${gray(`v${SERVER_VERSION}`)}  ${badge('MCP')}`, W));
  lines.push(boxLine(`${italic(gray('Local-first AI memory, code retrieval & knowledge graph'))}`, W));
  lines.push(boxLine('', W));
  lines.push(boxLine(`${green(BOX.check)} ${dim(`${TOOL_COUNT} MCP tools`)}  ${cyan(BOX.dot)} ${dim('Zero cloud deps')}  ${magenta('◇')} ${dim('Temporal KG')}`, W));
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
  lines.push(`  ${bold('EXAMPLES')}`);
  lines.push(`    ${cyan('localnest memory add')} ${gray('--content "JWT with refresh tokens" --kind decision')}`);
  lines.push(`    ${cyan('localnest memory search')} ${gray('--query "authentication"')}`);
  lines.push(`    ${cyan('localnest kg add')} ${gray('--subject "AuthService" --predicate "uses" --object "JWT"')}`);
  lines.push(`    ${cyan('localnest selftest')} ${gray('--json')}`);
  lines.push(`    ${cyan('localnest dashboard')}`);
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
