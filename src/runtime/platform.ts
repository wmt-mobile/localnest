/**
 * Cross-platform shim helpers for spawning external binaries.
 *
 * Why this exists:
 * - On Windows, Node's `child_process.spawn` does NOT auto-resolve PATHEXT
 *   like the shell does, so `spawnSync('rg', [...])` fails with ENOENT even
 *   when `rg.exe` is on PATH. We have to ask for the `.exe` (or `.cmd`)
 *   variant explicitly.
 * - npm-installed CLIs (`npm`, `npx`, `localnest`) ship as `.cmd` shims on
 *   Windows. Same problem, same solution.
 *
 * Centralizing this here keeps the platform check in one place instead of
 * sprinkling `process.platform === 'win32'` ternaries across every spawn site.
 */

export const isWindows = process.platform === 'win32';

/** ripgrep binary name — `rg.exe` on Windows, `rg` everywhere else. */
export const RG_BIN = isWindows ? 'rg.exe' : 'rg';

/** npm binary — `npm.cmd` on Windows. */
export const NPM_BIN = isWindows ? 'npm.cmd' : 'npm';

/** npx binary — `npx.cmd` on Windows. */
export const NPX_BIN = isWindows ? 'npx.cmd' : 'npx';

/** Local `localnest` CLI — `localnest.cmd` on Windows. */
export const LOCALNEST_BIN = isWindows ? 'localnest.cmd' : 'localnest';

/**
 * Generic helper for any tool that uses the same name+`.cmd` convention
 * (most npm-installed CLIs do).
 */
export function platformBin(name: string, winSuffix = '.cmd'): string {
  return isWindows ? `${name}${winSuffix}` : name;
}
