import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HOOKS_DIR = path.resolve(__dirname, '..', '..', '..', 'scripts', 'hooks');

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
  const installerPath = path.join(HOOKS_DIR, 'install-hooks.js');
  const result = spawnSync(process.execPath, [installerPath], {
    stdio: 'inherit',
    encoding: 'utf8',
  });
  process.exitCode = result.status || 0;
}

async function handleStatus() {
  const fs = await import('node:fs');
  const os = await import('node:os');
  const settingsPath = path.join(os.default.homedir(), '.claude', 'settings.json');

  try {
    const settings = JSON.parse(fs.default.readFileSync(settingsPath, 'utf8'));
    const hooks = settings.hooks || {};
    const preHooks = (hooks.PreToolUse || []).filter(e => e.hooks?.some(h => h.command?.includes('localnest')));
    const postHooks = (hooks.PostToolUse || []).filter(e => e.hooks?.some(h => h.command?.includes('localnest')));

    process.stdout.write(`\n  LocalNest Claude Code Hooks\n\n`);
    process.stdout.write(`  Pre-tool (memory retrieval):  ${preHooks.length > 0 ? 'INSTALLED' : 'NOT INSTALLED'}\n`);
    process.stdout.write(`  Post-tool (outcome capture):  ${postHooks.length > 0 ? 'INSTALLED' : 'NOT INSTALLED'}\n`);
    process.stdout.write(`  Settings file: ${settingsPath}\n\n`);

    if (preHooks.length === 0 && postHooks.length === 0) {
      process.stdout.write('  Run: localnest hooks install\n\n');
    }
  } catch {
    process.stdout.write(`\n  No Claude Code settings found at ${settingsPath}\n`);
    process.stdout.write('  Run: localnest hooks install\n\n');
  }
}
