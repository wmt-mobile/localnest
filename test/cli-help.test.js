import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

function runHelp(t, relativeScriptPath) {
  const scriptPath = path.resolve(relativeScriptPath);
  const result = spawnSync(process.execPath, [scriptPath, '--help'], { encoding: 'utf8' });
  if (result.error?.code === 'EPERM') {
    t.skip('process spawning is blocked in this environment');
    return null;
  }
  return result;
}

test('doctor help prints usage without running checks', (t) => {
  const result = runHelp(t, 'scripts/runtime/doctor-localnest.mjs');
  if (!result) return;

  assert.equal(result.status, 0);
  assert.match(result.stdout, /Usage:/);
  assert.doesNotMatch(result.stdout, /Doctor result:/);
});

test('setup help prints usage without runtime warning noise', (t) => {
  const result = runHelp(t, 'scripts/runtime/setup-localnest.mjs');
  if (!result) return;

  assert.equal(result.status, 0);
  assert.match(result.stdout, /LocalNest setup wizard/);
  assert.doesNotMatch(result.stderr, /ExperimentalWarning/);
});

test('localnest start --help prints usage without starting server', (t) => {
  const result = runHelp(t, 'bin/localnest.js');
  if (!result) return;

  assert.equal(result.status, 0);
  assert.match(result.stdout, /LocalNest|USAGE|Usage:/);
  assert.match(result.stdout, /install skills/);
});

test('localnest start subcommand help prints start usage without runtime noise', (t) => {
  const scriptPath = path.resolve('bin/localnest.js');
  const result = spawnSync(process.execPath, [scriptPath, 'start', '--help'], { encoding: 'utf8' });
  if (result.error?.code === 'EPERM') {
    t.skip('process spawning is blocked in this environment');
    return;
  }

  assert.equal(result.status, 0);
  assert.match(result.stdout, /LocalNest MCP server/);
  assert.doesNotMatch(result.stderr, /ExperimentalWarning/);
});

test('localnest task-context help prints canonical usage without executing workflow', (t) => {
  const scriptPath = path.resolve('bin/localnest.js');
  const result = spawnSync(process.execPath, [scriptPath, 'task-context', '--help'], { encoding: 'utf8' });
  if (result.error?.code === 'EPERM') {
    t.skip('process spawning is blocked in this environment');
    return;
  }

  assert.equal(result.status, 0);
  assert.match(result.stdout, /localnest task-context/);
  assert.doesNotMatch(result.stdout, /"runtime":/);
});

test('legacy setup wrapper prints deprecation warning and forwards to canonical help', (t) => {
  const scriptPath = path.resolve('bin/localnest-mcp-setup.js');
  const result = spawnSync(process.execPath, [scriptPath, '--help'], { encoding: 'utf8' });
  if (result.error?.code === 'EPERM') {
    t.skip('process spawning is blocked in this environment');
    return;
  }

  assert.equal(result.status, 0);
  assert.match(result.stderr, /deprecated/i);
  assert.match(result.stdout, /LocalNest setup wizard/);
});

test('task-context help prints usage without executing workflow', (t) => {
  const result = runHelp(t, 'scripts/memory/task-context-localnest.mjs');
  if (!result) return;

  assert.equal(result.status, 0);
  assert.match(result.stdout, /localnest task-context/);
  assert.doesNotMatch(result.stdout, /"runtime":/);
});

test('capture-outcome help prints usage without validation errors', (t) => {
  const result = runHelp(t, 'scripts/memory/capture-outcome-localnest.mjs');
  if (!result) return;

  assert.equal(result.status, 0);
  assert.match(result.stdout, /localnest capture-outcome/);
  assert.equal(result.stderr.trim(), '');
});
