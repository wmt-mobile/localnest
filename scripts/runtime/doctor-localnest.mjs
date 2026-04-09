#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  buildLocalnestPaths,
  findSqliteVecExtensionPath,
  resolveConfigPath as resolveDefaultConfigPath,
  resolveLocalnestHome,
  resolveWritableModelCacheDir,
  installRuntimeWarningFilter
} from '../../src/runtime/index.js';

if (!process.env.DART_SUPPRESS_ANALYTICS) {
  process.env.DART_SUPPRESS_ANALYTICS = 'true';
}

installRuntimeWarningFilter();

const argv = process.argv.slice(2);
const asJson = argv.includes('--json');

// Extract only needed env vars — avoids CodeQL CWE-532 taint from process.env to console.log
const safeEnv = {
  HOME: process.env.HOME || '',
  LOCALNEST_HOME: process.env.LOCALNEST_HOME || '',
  LOCALNEST_CONFIG: process.env.LOCALNEST_CONFIG || '',
  LOCALNEST_INDEX_BACKEND: process.env.LOCALNEST_INDEX_BACKEND || '',
  LOCALNEST_SQLITE_VEC_EXTENSION: process.env.LOCALNEST_SQLITE_VEC_EXTENSION || '',
  LOCALNEST_SQLITE_VEC_SEARCH_DIRS: process.env.LOCALNEST_SQLITE_VEC_SEARCH_DIRS || '',
  LOCALNEST_EMBED_CACHE_DIR: process.env.LOCALNEST_EMBED_CACHE_DIR || '',
  LOCALNEST_RERANKER_CACHE_DIR: process.env.LOCALNEST_RERANKER_CACHE_DIR || '',
  LOCALNEST_DOCTOR_STRICT: process.env.LOCALNEST_DOCTOR_STRICT || '',
  USER: process.env.USER || '',
  USERNAME: process.env.USERNAME || '',
};

function parseBoolean(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value).toLowerCase() === 'true';
}

function commandExists(cmd, args = ['--version']) {
  try {
    const result = spawnSync(cmd, args, { stdio: 'ignore' });
    return result.status === 0;
  } catch {
    return false;
  }
}

function getNpxCommand() {
  return process.platform === 'win32' ? 'npx.cmd' : 'npx';
}

function resolveConfigPath() {
  return resolveDefaultConfigPath({
    env: safeEnv,
    localnestHome: resolveLocalnestHome(safeEnv)
  });
}

function parseConfigForModelCacheDirs() {
  const out = {
    embeddingCacheDir: '',
    rerankerCacheDir: ''
  };
  const cfgPath = resolveConfigPath();
  try {
    if (!fs.existsSync(cfgPath)) return out;
    const parsed = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
    const byConfigEmbedding = parsed?.index?.embeddingCacheDir;
    const byConfigReranker = parsed?.index?.rerankerCacheDir;
    if (typeof byConfigEmbedding === 'string' && byConfigEmbedding.trim()) {
      out.embeddingCacheDir = path.resolve(byConfigEmbedding);
    }
    if (typeof byConfigReranker === 'string' && byConfigReranker.trim()) {
      out.rerankerCacheDir = path.resolve(byConfigReranker);
    }
  } catch {
    // Keep defaults.
  }
  return out;
}

function resolveIndexBackend() {
  const byEnv = (safeEnv.LOCALNEST_INDEX_BACKEND || '').trim();
  if (byEnv) return byEnv;

  const cfgPath = resolveConfigPath();
  try {
    if (!fs.existsSync(cfgPath)) return 'sqlite-vec';
    const parsed = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
    return parsed?.index?.backend || 'sqlite-vec';
  } catch {
    return 'sqlite-vec';
  }
}

function checkNodeVersion() {
  const major = Number.parseInt(process.versions.node.split('.')[0] || '0', 10);
  if (Number.isFinite(major) && major >= 18) {
    return { id: 'node_version', ok: true, detail: `Node.js ${process.versions.node}` };
  }
  return {
    id: 'node_version',
    ok: false,
    detail: `Node.js >=18 required. Current: ${process.versions.node}`,
    fix: 'Install Node.js 18+ and re-run doctor.'
  };
}

function checkNpmNpx() {
  const npmOk = commandExists('npm', ['--version']);
  const npxCmd = getNpxCommand();
  const npxOk = commandExists(npxCmd, ['--version']);

  if (npmOk && npxOk) {
    return { id: 'npm_npx', ok: true, detail: `npm and ${npxCmd} available` };
  }

  return {
    id: 'npm_npx',
    ok: false,
    detail: `Missing npm or ${npxCmd}`,
    fix: 'Install/reinstall Node.js with npm, then re-run doctor.'
  };
}

function checkRipgrep() {
  const ok = commandExists('rg');
  if (ok) {
    return { id: 'ripgrep', ok: true, detail: 'ripgrep available' };
  }

  let fix;
  if (process.platform === 'win32') {
    fix = 'Install ripgrep: winget install BurntSushi.ripgrep.MSVC';
  } else if (process.platform === 'darwin') {
    fix = 'Install ripgrep: brew install ripgrep';
  } else {
    fix = 'Install ripgrep: sudo apt-get install ripgrep';
  }

  return { id: 'ripgrep', ok: false, detail: 'ripgrep (rg) missing', fix };
}

async function checkSdkImport() {
  try {
    await import('@modelcontextprotocol/sdk/server/mcp.js');
    await import('@modelcontextprotocol/sdk/server/stdio.js');
    return { id: 'sdk_import', ok: true, detail: 'MCP SDK imports resolved' };
  } catch (error) {
    return {
      id: 'sdk_import',
      ok: false,
      detail: `MCP SDK import failed: ${error?.code || error?.message || 'unknown error'}`,
      fix: 'If running from source, run npm install. If using npx package, reinstall and retry.'
    };
  }
}

async function checkSqliteBackend() {
  if (resolveIndexBackend() !== 'sqlite-vec') {
    return { id: 'sqlite_backend', ok: true, detail: 'sqlite-vec backend not selected' };
  }

  try {
    await import('node:sqlite');
    return { id: 'sqlite_backend', ok: true, detail: 'node:sqlite available for sqlite-vec backend' };
  } catch {
    return {
      id: 'sqlite_backend',
      ok: false,
      detail: 'node:sqlite unavailable for sqlite-vec backend',
      fix: 'Use Node.js 22+ or switch backend to json in setup.'
    };
  }
}

function checkConfigFile() {
  const configPath = resolveConfigPath();
  if (!fs.existsSync(configPath)) {
    return {
      id: 'config_file',
      ok: false,
      detail: `Config not found: ${configPath}`,
      fix: 'Run localnest setup to create config.'
    };
  }

  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch {
    return {
      id: 'config_file',
      ok: false,
      detail: `Invalid JSON config: ${configPath}`,
      fix: 'Fix JSON syntax in localnest.config.json.'
    };
  }

  if (!parsed || !Array.isArray(parsed.roots) || parsed.roots.length === 0) {
    return {
      id: 'config_file',
      ok: false,
      detail: 'Config has no roots[]',
      fix: 'Add at least one valid root path in localnest.config.json.'
    };
  }

  const missing = [];
  for (const root of parsed.roots) {
    if (!root || typeof root.path !== 'string') {
      missing.push('<invalid-root-entry>');
      continue;
    }
    const resolved = path.resolve(root.path);
    if (!fs.existsSync(resolved) || !fs.statSync(resolved).isDirectory()) {
      missing.push(resolved);
    }
  }

  if (missing.length > 0) {
    return {
      id: 'config_file',
      ok: false,
      detail: `Some configured roots are missing: ${missing.join(', ')}`,
      fix: 'Update localnest.config.json with existing directories.'
    };
  }

  return {
    id: 'config_file',
    ok: true,
    detail: `Config OK (${configPath}) with ${parsed.roots.length} root(s)`
  };
}

function checkSqliteVecExtension() {
  if (resolveIndexBackend() !== 'sqlite-vec') {
    return { id: 'sqlite_vec_extension', ok: true, detail: 'sqlite-vec native extension not required for current backend' };
  }

  const configured = (safeEnv.LOCALNEST_SQLITE_VEC_EXTENSION || '').trim();
  const localnestHome = resolveLocalnestHome(safeEnv);
  const configuredPath = configured ? path.resolve(configured) : '';
  const detected = configuredPath
    ? (fs.existsSync(configuredPath) ? { path: configuredPath, source: 'configured' } : null)
    : findSqliteVecExtensionPath({
      localnestHome,
      env: safeEnv
    });

  if (detected?.path) {
    return {
      id: 'sqlite_vec_extension',
      ok: true,
      detail: `sqlite-vec native extension ready (${detected.path})`
    };
  }

  return {
    id: 'sqlite_vec_extension',
    ok: false,
    detail: configuredPath
      ? `sqlite-vec backend selected but configured vec0 path is missing: ${configuredPath}`
      : 'sqlite-vec backend selected but vec0 native extension is not configured',
    fix: 'Run localnest setup again so LocalNest can install/configure sqlite-vec, or set LOCALNEST_SQLITE_VEC_EXTENSION to the vec0 shared library path.'
  };
}

function checkModelCacheWritable() {
  const localnestHome = resolveLocalnestHome(safeEnv);
  const configCaches = parseConfigForModelCacheDirs();
  const defaultCache = buildLocalnestPaths(localnestHome).dirs.cache;
  const embedPreferred = path.resolve(
    (safeEnv.LOCALNEST_EMBED_CACHE_DIR || '').trim() ||
    configCaches.embeddingCacheDir ||
    defaultCache
  );
  const rerankerPreferred = path.resolve(
    (safeEnv.LOCALNEST_RERANKER_CACHE_DIR || '').trim() ||
    configCaches.rerankerCacheDir ||
    defaultCache
  );
  const embedResolved = resolveWritableModelCacheDir({
    preferredDir: embedPreferred,
    localnestHome,
    env: safeEnv
  });
  const rerankerResolved = resolveWritableModelCacheDir({
    preferredDir: rerankerPreferred,
    localnestHome,
    env: safeEnv
  });

  if (!embedResolved.writable || !rerankerResolved.writable) {
    return {
      id: 'model_cache',
      ok: false,
      detail: 'Model cache not writable for configured or fallback locations',
      fix: 'Set LOCALNEST_EMBED_CACHE_DIR/LOCALNEST_RERANKER_CACHE_DIR to a writable path, then re-run localnest setup.'
    };
  }

  const fallbackUsed = embedResolved.fallbackUsed || rerankerResolved.fallbackUsed;
  return {
    id: 'model_cache',
    ok: true,
    detail: fallbackUsed
      ? 'Model cache writable (fallback location active — run with --json for details)'
      : 'Model cache writable'
  };
}

function printText(results) {
  console.log('LocalNest Doctor');
  console.log('');

  for (const r of results) {
    const mark = r.ok ? 'OK' : 'FAIL';
    console.log(`[${mark}] ${r.id}: ${r.detail}`);
    if (!r.ok && r.fix) {
      console.log(`  fix: ${r.fix}`);
    }
  }

  const failed = results.filter((r) => !r.ok).length;
  console.log('');
  if (failed === 0) {
    console.log('Doctor result: healthy');
  } else {
    console.log(`Doctor result: ${failed} issue(s) found`);
  }
}

function printHelp() {
  process.stdout.write('LocalNest Doctor\n\n');
  process.stdout.write('Usage:\n');
  process.stdout.write('  localnest doctor\n');
  process.stdout.write('  localnest doctor --verbose\n');
  process.stdout.write('  localnest doctor --json\n');
  process.stdout.write('\nCompatibility alias (deprecated):\n');
  process.stdout.write('  localnest-mcp-doctor\n');
  process.stdout.write('  localnest-mcp-doctor --json\n');
  process.stdout.write('Options:\n');
  process.stdout.write('  --json      print JSON output\n');
  process.stdout.write('  --help,-h   show this help\n');
}

async function main() {
  if (argv.includes('--help') || argv.includes('-h')) {
    printHelp();
    return;
  }

  const checks = [
    checkNodeVersion(),
    checkNpmNpx(),
    checkRipgrep(),
    await checkSdkImport(),
    await checkSqliteBackend(),
    checkSqliteVecExtension(),
    checkConfigFile(),
    checkModelCacheWritable()
  ];

  if (asJson) {
    console.log(JSON.stringify({ ok: checks.every((c) => c.ok), checks }, null, 2));
  } else {
    printText(checks);
  }

  const strict = parseBoolean(safeEnv.LOCALNEST_DOCTOR_STRICT, true);
  if (strict && checks.some((c) => !c.ok)) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('[localnest-doctor] fatal:', error?.message || error);
  process.exit(1);
});
