/**
 * Ingest CLI subcommands.
 *
 * Stubs for Phase 15 implementation:
 *   localnest ingest <file> [--format markdown|json] [--nest <n>] [--branch <b>]
 *
 * @module src/cli/commands/ingest
 */

const VERBS = [
  { name: '<file>', desc: 'Ingest a conversation file (auto-detect format)' },
];

/**
 * @param {string[]} args
 * @param {import('../options.js').GlobalOptions} opts
 */
export async function run(args, opts) {
  const target = args[0] || '';

  if (!target || target === 'help' || target === '--help' || target === '-h') {
    const lines = [
      '',
      '  localnest ingest <file> [options]',
      '',
      '  Options:',
      '    --format markdown|json   Override format auto-detection',
      '    --nest <name>            Assign nest taxonomy',
      '    --branch <name>          Assign branch taxonomy',
      '',
    ];
    process.stdout.write(lines.join('\n') + '\n');
    return;
  }

  if (opts.json) {
    process.stdout.write(JSON.stringify({ error: 'ingest is not yet implemented. Coming in Phase 15.' }) + '\n');
  } else {
    process.stdout.write('ingest is not yet implemented. Coming in Phase 15.\n');
  }
}
