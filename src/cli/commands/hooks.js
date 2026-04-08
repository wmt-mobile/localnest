import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// CLI lives at <root>/src/cli/commands/ — hooks at <root>/scripts/hooks/
const PKG_ROOT = path.resolve(__dirname, '..', '..', '..');
const HOOKS_DIR = path.join(PKG_ROOT, 'scripts', 'hooks');

const HANDLERS = {
  install: handleInstall,
  status: handleStatus,
};

export async function run(args, opts) {
  const sub = args[0] || '';
  const handler = HANDLERS[sub];
  if (!handler) {
    process.stdout.write([
      '',
      '  localnest hooks install    Install Claude Code hooks for auto memory retrieval/capture',
      '  localnest hooks status     Show installed hook status',
      '',
    ].join('\n'));
    return;
  }
  await handler(args.slice(1), opts);
}

async function handleInstall() {
  const installerPath = path.join(HOOKS_DIR, 'install-hooks.cjs');
  if (!fs.existsSync(installerPath)) {
    process.stderr.write(`[localnest] Hook installer not found at ${installerPath}\n`);
    process.stderr.write('[localnest] Package may be corrupted. Reinstall with: npm install -g localnest-mcp\n');
    process.exitCode = 1;
    return;
  }
  const result = spawnSync(process.execPath, [installerPath], {
    stdio: 'inherit',
    encoding: 'utf8',
  });
  process.exitCode = result.status || 0;
}

async function handleStatus() {
  const settingsPath = path.join(os.homedir(), '.claude', 'settings.json');

  try {
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    const hooks = settings.hooks || {};
    const preHooks = (hooks.PreToolUse || []).filter(e => e.hooks?.some(h => h.command?.includes('localnest')));
    const postHooks = (hooks.PostToolUse || []).filter(e => e.hooks?.some(h => h.command?.includes('localnest')));

    const preInstalled = preHooks.length > 0;
    const postInstalled = postHooks.length > 0;

    process.stdout.write(`\n  LocalNest Claude Code Hooks\n\n`);
    process.stdout.write(`  Pre-tool (memory retrieval):  ${preInstalled ? '\x1b[32mINSTALLED\x1b[0m' : '\x1b[31mNOT INSTALLED\x1b[0m'}\n`);
    process.stdout.write(`  Post-tool (outcome capture):  ${postInstalled ? '\x1b[32mINSTALLED\x1b[0m' : '\x1b[31mNOT INSTALLED\x1b[0m'}\n`);
    process.stdout.write(`  Settings file: ${settingsPath}\n\n`);

    if (!preInstalled || !postInstalled) {
      process.stdout.write('  Run: localnest hooks install\n\n');
    }

    // Verify hook scripts exist at referenced paths
    for (const entry of [...preHooks, ...postHooks]) {
      for (const h of (entry.hooks || [])) {
        const cmdMatch = h.command?.match(/node\s+"?([^"]+)"?/);
        if (cmdMatch) {
          const scriptPath = cmdMatch[1];
          const exists = fs.existsSync(scriptPath);
          if (!exists) {
            process.stdout.write(`  \x1b[33mWARNING\x1b[0m: Hook script missing: ${scriptPath}\n`);
            process.stdout.write('  Re-run: localnest hooks install\n\n');
          }
        }
      }
    }
  } catch {
    process.stdout.write(`\n  No Claude Code settings found at ${settingsPath}\n`);
    process.stdout.write('  Run: localnest hooks install\n\n');
  }
}
