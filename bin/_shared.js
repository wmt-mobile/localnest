export function hasVersionFlag(argv = process.argv) {
  return argv.includes('--version') || argv.includes('-v');
}

export function buildForwardArgv(rest, argv = process.argv) {
  return [argv[0], argv[1], ...rest];
}

export async function importRelative(modulePath, metaUrl) {
  return import(new URL(modulePath, metaUrl));
}
