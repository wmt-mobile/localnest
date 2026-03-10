import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { buildForwardArgv, hasVersionFlag } from '../bin/_shared.js';
import { SERVER_VERSION } from '../src/runtime/version.js';

function assertVersionCommand(t, scriptPath) {
  const result = spawnSync(process.execPath, [scriptPath, '--version'], { encoding: 'utf8' });
  if (result.error?.code === 'EPERM') {
    t.skip('process spawning is blocked in this environment');
    return;
  }

  assert.equal(result.status, 0);
  assert.equal(result.stdout.trim(), SERVER_VERSION);
  assert.equal(result.stderr.trim(), '');
}

test('hasVersionFlag detects short and long flags', () => {
  assert.equal(hasVersionFlag(['node', 'bin', '--version']), true);
  assert.equal(hasVersionFlag(['node', 'bin', '-v']), true);
  assert.equal(hasVersionFlag(['node', 'bin', 'start']), false);
});

test('buildForwardArgv preserves process launcher slots', () => {
  const out = buildForwardArgv(['doctor', '--verbose'], ['node', 'bin/localnest.js', 'setup']);
  assert.deepEqual(out, ['node', 'bin/localnest.js', 'doctor', '--verbose']);
});

test('localnest --version prints version without starting runtime-heavy paths', (t) => {
  const scriptPath = path.resolve('bin/localnest.js');
  assertVersionCommand(t, scriptPath);
});

test('localnest-mcp --version prints version without starting MCP server', (t) => {
  const scriptPath = path.resolve('bin/localnest-mcp.js');
  assertVersionCommand(t, scriptPath);
});
