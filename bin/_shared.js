import { fileURLToPath } from 'node:url';

export function hasVersionFlag(argv = process.argv) {
  return argv.includes('--version') || argv.includes('-v');
}

export function buildForwardArgv(rest, argv = process.argv) {
  return [argv[0], argv[1], ...rest];
}

export function buildLocalnestCommandArgv(commandArgs = [], metaUrl, argv = process.argv) {
  return [
    argv[0],
    fileURLToPath(new URL('./localnest.js', metaUrl)),
    ...commandArgs,
    ...argv.slice(2)
  ];
}

export function printDeprecationWarning({ legacyCommand, replacementCommand, note = '' }) {
  if (process.env.LOCALNEST_SUPPRESS_DEPRECATION_WARNINGS === 'true') return;
  const yellow = '\x1b[33m';
  const reset = '\x1b[0m';
  const suffix = note ? ` ${note}` : '';
  process.stderr.write(
    `${yellow}[localnest] DEPRECATED: Use "${replacementCommand}" instead of "${legacyCommand}".${suffix}${reset}\n`
  );
}

export async function forwardDeprecatedCommand({
  metaUrl,
  legacyCommand,
  replacementCommand,
  commandArgs = [],
  note = ''
}) {
  printDeprecationWarning({ legacyCommand, replacementCommand, note });
  process.argv = buildLocalnestCommandArgv(commandArgs, metaUrl, process.argv);
  return importRelative('./localnest.js', metaUrl);
}

export async function importRelative(modulePath, metaUrl) {
  return import(new URL(modulePath, metaUrl));
}
