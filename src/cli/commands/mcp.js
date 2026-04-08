/**
 * MCP lifecycle CLI subcommands.
 *
 * Stubs for Phase 14 implementation:
 *   localnest mcp start | status | config
 *
 * @module src/cli/commands/mcp
 */

import { printSubcommandHelp } from '../help.js';

const VERBS = [
  { name: 'start', desc: 'Start MCP server (stdio)' },
  { name: 'status', desc: 'Show MCP server status' },
  { name: 'config', desc: 'Output MCP client config JSON' },
];

/**
 * @param {string[]} args
 * @param {import('../options.js').GlobalOptions} opts
 */
export async function run(args, opts) {
  const verb = args[0] || '';

  if (!verb || verb === 'help' || verb === '--help' || verb === '-h') {
    printSubcommandHelp('mcp', VERBS);
    return;
  }

  const known = VERBS.find((v) => v.name === verb);
  if (!known) {
    process.stderr.write(`Unknown mcp command: ${verb}\n`);
    printSubcommandHelp('mcp', VERBS);
    process.exitCode = 1;
    return;
  }

  if (opts.json) {
    process.stdout.write(JSON.stringify({ error: `mcp ${verb} is not yet implemented. Coming in Phase 14.` }) + '\n');
  } else {
    process.stdout.write(`mcp ${verb} is not yet implemented. Coming in Phase 14.\n`);
  }
}
