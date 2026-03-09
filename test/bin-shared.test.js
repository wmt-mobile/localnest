import test from 'node:test';
import assert from 'node:assert/strict';
import { buildForwardArgv, hasVersionFlag } from '../bin/_shared.js';

test('hasVersionFlag detects short and long flags', () => {
  assert.equal(hasVersionFlag(['node', 'bin', '--version']), true);
  assert.equal(hasVersionFlag(['node', 'bin', '-v']), true);
  assert.equal(hasVersionFlag(['node', 'bin', 'start']), false);
});

test('buildForwardArgv preserves process launcher slots', () => {
  const out = buildForwardArgv(['doctor', '--verbose'], ['node', 'bin/localnest.js', 'setup']);
  assert.deepEqual(out, ['node', 'bin/localnest.js', 'doctor', '--verbose']);
});
