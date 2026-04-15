import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  ensureSqliteVecExtension,
  findSqliteVecExtensionPath
} from '../src/runtime/sqlite-vec-extension.js';

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'localnest-sqlite-vec-test-'));
}

function extensionName() {
  if (process.platform === 'win32') return 'vec0.dll';
  if (process.platform === 'darwin') return 'vec0.dylib';
  return 'vec0.so';
}

test('findSqliteVecExtensionPath discovers vec0 under LocalNest vendor tree', () => {
  const localnestHome = makeTempDir();
  const libDir = path.join(localnestHome, 'vendor', 'sqlite-vec', 'node_modules', 'sqlite-vec', 'dist');
  fs.mkdirSync(libDir, { recursive: true });
  const libPath = path.join(libDir, extensionName());
  fs.writeFileSync(libPath, 'binary', 'utf8');

  const result = findSqliteVecExtensionPath({
    localnestHome,
    env: {}
  });

  assert.equal(result.path, libPath);
  assert.equal(result.source, 'localnest-vendor');

  fs.rmSync(localnestHome, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
});

test('ensureSqliteVecExtension installs sqlite-vec into LocalNest vendor tree when missing', () => {
  const localnestHome = makeTempDir();
  const installSpawn = (command, args, options) => {
    if (command === 'npm' && Array.isArray(args) && args[0] === 'root') {
      return { status: 0, stdout: `${path.join(localnestHome, 'missing-global')}\n` };
    }
    if (command === 'npm' && Array.isArray(args) && args[0] === 'install') {
      const libDir = path.join(options.cwd, 'node_modules', 'sqlite-vec', 'dist');
      fs.mkdirSync(libDir, { recursive: true });
      fs.writeFileSync(path.join(libDir, extensionName()), 'binary', 'utf8');
      return { status: 0, stdout: '', stderr: '' };
    }
    return { status: 1, stdout: '', stderr: '' };
  };

  const result = ensureSqliteVecExtension({
    localnestHome,
    env: {},
    installIfMissing: true,
    spawn: installSpawn
  });

  assert.equal(result.ok, true);
  assert.equal(result.installed, true);
  assert.match(result.path, new RegExp(`${extensionName().replace('.', '\\.')}$`));

  fs.rmSync(localnestHome, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
});
