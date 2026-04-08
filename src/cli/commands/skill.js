/**
 * Skill CLI subcommands.
 *
 * Stubs for Phase 13 implementation:
 *   localnest skill install | list | remove
 *
 * @module src/cli/commands/skill
 */

import { printSubcommandHelp } from '../help.js';

const VERBS = [
  { name: 'install', desc: 'Install bundled skills to AI clients' },
  { name: 'list', desc: 'List installed skills' },
  { name: 'remove', desc: 'Remove a skill' },
];

/**
 * @param {string[]} args
 * @param {import('../options.js').GlobalOptions} opts
 */
export async function run(args, opts) {
  const verb = args[0] || '';

  if (!verb || verb === 'help' || verb === '--help' || verb === '-h') {
    printSubcommandHelp('skill', VERBS);
    return;
  }

  const known = VERBS.find((v) => v.name === verb);
  if (!known) {
    process.stderr.write(`Unknown skill command: ${verb}\n`);
    printSubcommandHelp('skill', VERBS);
    process.exitCode = 1;
    return;
  }

  if (opts.json) {
    process.stdout.write(JSON.stringify({ error: `skill ${verb} is not yet implemented. Coming in Phase 13.` }) + '\n');
  } else {
    process.stdout.write(`skill ${verb} is not yet implemented. Coming in Phase 13.\n`);
  }
}
