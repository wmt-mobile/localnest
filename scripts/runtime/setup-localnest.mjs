#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import {
  ensureSqliteVecExtension,
  migrateLocalnestHomeLayout,
  resolveLocalnestHome,
  resolveWritableModelCacheDir
} from '../../src/runtime/index.js';
import {
  buildLocalnestServerConfig,
  installLocalnestIntoDetectedClients
} from '../../src/setup/client-installer.js';

if (!process.env.DART_SUPPRESS_ANALYTICS) {
  process.env.DART_SUPPRESS_ANALYTICS = 'true';
}

const cwd = process.cwd();
// Extract only HOME for path resolution — avoids CodeQL CWE-532 taint from process.env
const homeOnlyEnv = { HOME: process.env.HOME || '' };
const localnestHome = resolveLocalnestHome(homeOnlyEnv);
const layout = migrateLocalnestHomeLayout(localnestHome).paths;
const configPath = layout.configPath;
const snippetPath = layout.snippetPath;
const defaultDbPath = layout.sqliteDbPath;
const defaultJsonIndexPath = layout.jsonIndexPath;
const defaultMemoryDbPath = layout.memoryDbPath;
const argv = process.argv.slice(2);

function isDir(p) {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function toLabel(dirPath, fallback = 'root') {
  const base = path.basename(dirPath);
  const safe = (base || fallback).replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase();
  return safe || fallback;
}

function expandHome(p) {
  if (!p) return p;
  return p.replace(/^~(?=$|\/)/, os.homedir());
}

function collectSuggestions() {
  const home = os.homedir();
  const candidates = [
    path.join(home, 'projects'),
    path.join(home, 'project'),
    path.join(home, 'code'),
    path.join(home, 'workspace'),
    path.join(home, 'work'),
    cwd
  ];

  const unique = [];
  const seen = new Set();
  for (const p of candidates) {
    const resolved = path.resolve(p);
    if (seen.has(resolved)) continue;
    seen.add(resolved);
    if (isDir(resolved)) unique.push(resolved);
  }
  return unique;
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

function getGlobalCommand() {
  return process.platform === 'win32' ? 'localnest-mcp.cmd' : 'localnest-mcp';
}

function runPreflightChecks() {
  const errors = [];
  const warnings = [];

  const majorNode = Number.parseInt(process.versions.node.split('.')[0] || '0', 10);
  if (!Number.isFinite(majorNode) || majorNode < 18) {
    errors.push(`Node.js 18+ is required. Current: ${process.versions.node}`);
  }
  if (Number.isFinite(majorNode) && majorNode < 22) {
    warnings.push(`Node.js ${process.versions.node} does not provide built-in node:sqlite. LocalNest setup will use the json index backend and disable local memory unless you upgrade to Node 22+.`);
  }

  const hasGlobal = commandExists(getGlobalCommand());
  const hasNpx = commandExists(getNpxCommand());
  if (!hasGlobal && !hasNpx) {
    errors.push('Neither localnest-mcp nor npx is available. Install LocalNest globally or fix Node.js/npm and retry.');
  }

  if (!commandExists('rg')) {
    errors.push('ripgrep (rg) is required for efficient search. Install it and re-run setup.');
  }

  return { errors, warnings, majorNode };
}

function supportsNodeSqlite() {
  const majorNode = Number.parseInt(process.versions.node.split('.')[0] || '0', 10);
  return Number.isFinite(majorNode) && majorNode >= 22;
}

function resolveCompatibleSetupOptions({ backend, memoryEnabled }) {
  let resolvedBackend = backend;
  let resolvedMemoryEnabled = memoryEnabled;
  const warnings = [];

  if (!supportsNodeSqlite()) {
    if (resolvedBackend === 'sqlite-vec') {
      resolvedBackend = 'json';
      warnings.push(`sqlite-vec requires Node 22+ because it depends on built-in node:sqlite. Falling back to json backend on Node ${process.versions.node}.`);
    }
    if (resolvedMemoryEnabled) {
      resolvedMemoryEnabled = false;
      warnings.push(`Local memory requires Node 22+ because it depends on built-in node:sqlite. Disabling memory on Node ${process.versions.node}.`);
    }
  }

  return {
    backend: resolvedBackend,
    memoryEnabled: resolvedMemoryEnabled,
    warnings
  };
}

function buildLocalnestEnv(indexConfig) {
  const env = {
    MCP_MODE: 'stdio',
    LOCALNEST_CONFIG: configPath,
    LOCALNEST_INDEX_BACKEND: indexConfig.backend,
    LOCALNEST_DB_PATH: indexConfig.dbPath,
    LOCALNEST_INDEX_PATH: indexConfig.indexPath,
    LOCALNEST_EMBED_PROVIDER: indexConfig.embedding.provider,
    LOCALNEST_EMBED_MODEL: indexConfig.embedding.model,
    LOCALNEST_EMBED_CACHE_DIR: indexConfig.embedding.cacheDir,
    LOCALNEST_EMBED_DIMS: String(indexConfig.embedding.dimensions),
    LOCALNEST_RERANKER_PROVIDER: indexConfig.reranker.provider,
    LOCALNEST_RERANKER_MODEL: indexConfig.reranker.model,
    LOCALNEST_RERANKER_CACHE_DIR: indexConfig.reranker.cacheDir,
    LOCALNEST_MEMORY_ENABLED: String(indexConfig.memory.enabled),
    LOCALNEST_MEMORY_BACKEND: indexConfig.memory.backend,
    LOCALNEST_MEMORY_DB_PATH: indexConfig.memory.dbPath
  };
  if (indexConfig.sqliteVecExtensionPath) {
    env.LOCALNEST_SQLITE_VEC_EXTENSION = indexConfig.sqliteVecExtensionPath;
  }
  return env;
}

function buildClientSnippet(packageRef, indexConfig) {
  const launch = resolveLaunchPreference(packageRef);
  return {
    mcpServers: {
      localnest: buildLocalnestServerConfig({
        command: launch.command,
        args: launch.args,
        env: buildLocalnestEnv(indexConfig)
      })
    }
  };
}

function buildNpxClientSnippet(packageRef, indexConfig) {
  return {
    mcpServers: {
      localnest: buildLocalnestServerConfig({
        command: getNpxCommand(),
        args: ['-y', packageRef],
        env: buildLocalnestEnv(indexConfig)
      })
    }
  };
}

function buildGlobalClientSnippet(indexConfig) {
  return {
    mcpServers: {
      localnest: buildLocalnestServerConfig({
        command: getGlobalCommand(),
        env: buildLocalnestEnv(indexConfig)
      })
    }
  };
}

function resolveLaunchPreference(packageRef) {
  if (commandExists(getGlobalCommand())) {
    return { command: getGlobalCommand(), args: [] };
  }
  return { command: getNpxCommand(), args: ['-y', packageRef] };
}

function parseArg(name) {
  const long = `--${name}=`;
  const item = argv.find((a) => a.startsWith(long));
  if (!item) return null;
  return item.slice(long.length).trim();
}

function parseBooleanArg(name) {
  const raw = parseArg(name);
  if (raw === null) return null;
  const normalized = raw.trim().toLowerCase();
  if (normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'y') return true;
  if (normalized === 'false' || normalized === '0' || normalized === 'no' || normalized === 'n') return false;
  throw new Error(`Invalid boolean for --${name}: ${raw}`);
}

function parseIntegerArg(name, fallback) {
  const raw = parseArg(name);
  if (raw === null || raw === '') return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid integer for --${name}: ${raw}`);
  }
  return parsed;
}

function parseRootsFromPathsArg(pathsArg) {
  if (!pathsArg) return [];

  const roots = [];
  for (const raw of pathsArg.split(',').map((x) => x.trim()).filter(Boolean)) {
    const resolved = path.resolve(expandHome(raw));
    if (!isDir(resolved)) continue;
    roots.push({
      label: toLabel(resolved, `root${roots.length + 1}`),
      path: resolved
    });
  }
  return roots;
}

function parseRootsFromJsonArg(rootsJsonArg) {
  if (!rootsJsonArg) return [];
  let parsed;
  try {
    parsed = JSON.parse(rootsJsonArg);
  } catch {
    throw new Error('Invalid JSON provided in --roots-json');
  }
  if (!Array.isArray(parsed)) {
    throw new Error('--roots-json must be a JSON array');
  }

  const roots = [];
  for (const item of parsed) {
    if (!item || typeof item !== 'object') continue;
    if (typeof item.path !== 'string' || item.path.trim() === '') continue;
    const resolved = path.resolve(expandHome(item.path.trim()));
    if (!isDir(resolved)) continue;
    const label = typeof item.label === 'string' && item.label.trim()
      ? item.label.trim()
      : toLabel(resolved, `root${roots.length + 1}`);
    roots.push({ label, path: resolved });
  }

  return roots;
}

function readExistingConfig() {
  try {
    if (!fs.existsSync(configPath)) return null;
    const parsed = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

function sanitizeExistingRoots(existingRoots) {
  if (!Array.isArray(existingRoots)) return [];
  const roots = [];
  for (const item of existingRoots) {
    if (!item || typeof item.path !== 'string' || item.path.trim() === '') continue;
    const resolved = path.resolve(expandHome(item.path.trim()));
    if (!isDir(resolved)) continue;
    const label = typeof item.label === 'string' && item.label.trim()
      ? item.label.trim()
      : toLabel(resolved, `root${roots.length + 1}`);
    roots.push({ label, path: resolved });
  }
  return roots;
}

function buildExistingDefaults(existingConfig) {
  const roots = sanitizeExistingRoots(existingConfig?.roots);
  const existingIndex = existingConfig?.index || {};
  const existingMemory = existingConfig?.memory || {};

  return {
    roots,
    backend: typeof existingIndex.backend === 'string' && existingIndex.backend.trim()
      ? existingIndex.backend.trim()
      : 'sqlite-vec',
    dbPath: typeof existingIndex.dbPath === 'string' && existingIndex.dbPath.trim()
      ? path.resolve(expandHome(existingIndex.dbPath))
      : defaultDbPath,
    indexPath: typeof existingIndex.indexPath === 'string' && existingIndex.indexPath.trim()
      ? path.resolve(expandHome(existingIndex.indexPath))
      : defaultJsonIndexPath,
    chunkLines: Number.isFinite(existingIndex.chunkLines) ? existingIndex.chunkLines : 60,
    chunkOverlap: Number.isFinite(existingIndex.chunkOverlap) ? existingIndex.chunkOverlap : 15,
    maxTermsPerChunk: Number.isFinite(existingIndex.maxTermsPerChunk) ? existingIndex.maxTermsPerChunk : 80,
    maxIndexedFiles: Number.isFinite(existingIndex.maxIndexedFiles) ? existingIndex.maxIndexedFiles : 20000,
    embeddingProvider: typeof existingIndex.embeddingProvider === 'string' && existingIndex.embeddingProvider.trim()
      ? existingIndex.embeddingProvider.trim()
      : 'huggingface',
    embeddingModel: typeof existingIndex.embeddingModel === 'string' && existingIndex.embeddingModel.trim()
      ? existingIndex.embeddingModel.trim()
      : 'sentence-transformers/all-MiniLM-L6-v2',
    embedCachePreferred: typeof existingIndex.embeddingCacheDir === 'string' && existingIndex.embeddingCacheDir.trim()
      ? path.resolve(expandHome(existingIndex.embeddingCacheDir))
      : layout.dirs.cache,
    embeddingDimensions: Number.isFinite(existingIndex.embeddingDimensions) ? existingIndex.embeddingDimensions : 384,
    rerankerProvider: typeof existingIndex.rerankerProvider === 'string' && existingIndex.rerankerProvider.trim()
      ? existingIndex.rerankerProvider.trim()
      : 'huggingface',
    rerankerModel: typeof existingIndex.rerankerModel === 'string' && existingIndex.rerankerModel.trim()
      ? existingIndex.rerankerModel.trim()
      : 'cross-encoder/ms-marco-MiniLM-L-6-v2',
    rerankerCachePreferred: typeof existingIndex.rerankerCacheDir === 'string' && existingIndex.rerankerCacheDir.trim()
      ? path.resolve(expandHome(existingIndex.rerankerCacheDir))
      : layout.dirs.cache,
    memoryEnabled: typeof existingMemory.enabled === 'boolean' ? existingMemory.enabled : false,
    memoryBackend: typeof existingMemory.backend === 'string' && existingMemory.backend.trim()
      ? existingMemory.backend.trim()
      : 'auto',
    memoryDbPath: typeof existingMemory.dbPath === 'string' && existingMemory.dbPath.trim()
      ? path.resolve(expandHome(existingMemory.dbPath))
      : defaultMemoryDbPath,
    memoryAutoCapture: typeof existingMemory.autoCapture === 'boolean'
      ? existingMemory.autoCapture
      : (typeof existingMemory.enabled === 'boolean' ? existingMemory.enabled : false),
    memoryConsentDone: typeof existingMemory.askForConsentDone === 'boolean'
      ? existingMemory.askForConsentDone
      : false
  };
}

function resolveModelCacheDirs(preferredEmbedDir, preferredRerankerDir) {
  // Extract only needed vars — avoids CodeQL CWE-532 (clear-text logging of env)
  const safeEnv = { HOME: process.env.HOME || '', USER: process.env.USER || '', USERNAME: process.env.USERNAME || '' };
  const embed = resolveWritableModelCacheDir({
    preferredDir: preferredEmbedDir,
    localnestHome,
    env: safeEnv
  });
  const reranker = resolveWritableModelCacheDir({
    preferredDir: preferredRerankerDir,
    localnestHome,
    env: safeEnv
  });

  if (embed.fallbackUsed) {
    console.log('[setup] info: embedding cache using fallback path');
    console.log(`  preferred: ${embed.preferredPath}`);
    console.log(`  resolved: ${embed.path}`);
  }
  if (reranker.fallbackUsed) {
    console.log('[setup] info: reranker cache using fallback path');
    console.log(`  preferred: ${reranker.preferredPath}`);
    console.log(`  resolved: ${reranker.path}`);
  }

  return {
    embeddingCacheDir: embed.path,
    rerankerCacheDir: reranker.path
  };
}

function resolveSqliteVecPreference(indexConfig) {
  if (indexConfig.backend !== 'sqlite-vec') {
    return {
      sqliteVecExtensionPath: '',
      sqliteVecInstallStatus: {
        ok: true,
        installed: false,
        source: 'not-required',
        reason: 'json backend selected'
      }
    };
  }

  const explicitPath = parseArg('sqlite-vec-extension');
  if (explicitPath) {
    return {
      sqliteVecExtensionPath: path.resolve(expandHome(explicitPath)),
      sqliteVecInstallStatus: {
        ok: true,
        installed: false,
        source: 'configured',
        reason: 'explicit path provided'
      }
    };
  }

  const skipInstall = parseBooleanArg('skip-sqlite-vec-install') ?? false;
  const installResult = ensureSqliteVecExtension({
    localnestHome,
    env: { ...homeOnlyEnv, LOCALNEST_SQLITE_VEC_SEARCH_DIRS: process.env.LOCALNEST_SQLITE_VEC_SEARCH_DIRS || '' },
    installIfMissing: !skipInstall
  });
  return {
    sqliteVecExtensionPath: installResult.ok ? installResult.path : '',
    sqliteVecInstallStatus: installResult
  };
}

function saveOutputs(roots, packageRef, indexConfig) {
  fs.mkdirSync(layout.dirs.config, { recursive: true });
  fs.mkdirSync(layout.dirs.data, { recursive: true });
  fs.mkdirSync(layout.dirs.cache, { recursive: true });
  fs.mkdirSync(layout.dirs.backups, { recursive: true });
  fs.mkdirSync(layout.dirs.vendor, { recursive: true });
  const config = {
    name: 'localnest',
    version: 4,
    updatedAt: new Date().toISOString(),
    roots,
    index: {
      backend: indexConfig.backend,
      dbPath: indexConfig.dbPath,
      indexPath: indexConfig.indexPath,
      chunkLines: indexConfig.chunkLines,
      chunkOverlap: indexConfig.chunkOverlap,
      maxTermsPerChunk: indexConfig.maxTermsPerChunk,
      maxIndexedFiles: indexConfig.maxIndexedFiles,
      sqliteVecExtensionPath: indexConfig.sqliteVecExtensionPath || '',
      embeddingProvider: indexConfig.embedding.provider,
      embeddingModel: indexConfig.embedding.model,
      embeddingCacheDir: indexConfig.embedding.cacheDir,
      embeddingDimensions: indexConfig.embedding.dimensions,
      rerankerProvider: indexConfig.reranker.provider,
      rerankerModel: indexConfig.reranker.model,
      rerankerCacheDir: indexConfig.reranker.cacheDir
    },
    memory: {
      enabled: indexConfig.memory.enabled,
      backend: indexConfig.memory.backend,
      dbPath: indexConfig.memory.dbPath,
      autoCapture: indexConfig.memory.autoCapture,
      askForConsentDone: indexConfig.memory.askForConsentDone
    }
  };

  fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
  fs.writeFileSync(snippetPath, `${JSON.stringify(buildClientSnippet(packageRef, indexConfig), null, 2)}\n`, 'utf8');
}

function installClientConfigs(packageRef, indexConfig) {
  const snippet = buildClientSnippet(packageRef, indexConfig);
  const serverConfig = snippet.mcpServers.localnest;
  return installLocalnestIntoDetectedClients({
    serverConfig,
    backupDir: layout.dirs.backups
  });
}

async function warmupModels(indexConfig) {
  const { EmbeddingService, RerankerService } = await import('../../src/services/retrieval/index.js');

  if (indexConfig?.embedding?.provider && indexConfig.embedding.provider !== 'none') {
    process.stdout.write('[setup] warming up embedding model (first run downloads model files)...\n');
    try {
      const embedding = new EmbeddingService({
        provider: indexConfig.embedding.provider,
        model: indexConfig.embedding.model,
        cacheDir: indexConfig.embedding.cacheDir
      });
      await embedding.embed('localnest embedding warmup');
    } catch (error) {
      process.stderr.write(`[setup] warning: embedding warmup failed: ${error?.message || error}\n`);
    }
  }

  if (indexConfig?.reranker?.provider && indexConfig.reranker.provider !== 'none') {
    process.stdout.write('[setup] warming up reranker model (first run downloads model files)...\n');
    try {
      const reranker = new RerankerService({
        provider: indexConfig.reranker.provider,
        model: indexConfig.reranker.model,
        cacheDir: indexConfig.reranker.cacheDir
      });
      await reranker.score('warmup query', 'warmup candidate');
    } catch (error) {
      process.stderr.write(`[setup] warning: reranker warmup failed: ${error?.message || error}\n`);
    }
  }
}

function printSuccess(packageRef, indexConfig) {
  const launch = resolveLaunchPreference(packageRef);
  const globalSnippet = buildGlobalClientSnippet(indexConfig);
  const preferredSnippet = buildClientSnippet(packageRef, indexConfig);
  const npxSnippet = buildNpxClientSnippet(packageRef, indexConfig);
  const clientInstall = installClientConfigs(packageRef, indexConfig);

  console.log('');
  console.log(`Saved root config: ${configPath}`);
  console.log(`Saved client snippet: ${snippetPath}`);
  console.log(`Preferred LocalNest launcher: ${launch.command}${launch.args.length ? ` ${launch.args.join(' ')}` : ''}`);
  if (indexConfig.backend === 'sqlite-vec') {
    if (indexConfig.sqliteVecExtensionPath) {
      console.log(`Configured sqlite-vec native extension: ${indexConfig.sqliteVecExtensionPath}`);
    } else {
      console.log('sqlite-vec native extension not configured. LocalNest will not have vec0 acceleration until setup can detect or install it.');
    }
  }
  console.log('');
  if (clientInstall.installed.length > 0) {
    console.log('Auto-installed LocalNest into detected AI tools:');
    for (const result of clientInstall.installed) {
      console.log(`- ${result.tool}: ${result.status} (${result.configPath})`);
    }
    console.log('');
  }
  if (clientInstall.unsupported.length > 0) {
    console.log('Detected but not auto-configured:');
    for (const item of clientInstall.unsupported) {
      console.log(`- ${item.label}: ${item.reason}`);
    }
    console.log('');
  }
  console.log('');
  console.log('Next steps:');
  console.log('1) Restart the AI tools that were updated above');
  console.log('2) If your preferred tool was not updated automatically, copy-paste this MCP config block into its config:');
  console.log('');
  console.log(JSON.stringify(preferredSnippet, null, 2));
  console.log('');
  console.log('3) Use tools: localnest_index_status, localnest_index_project, localnest_search_hybrid, localnest_read_file');
  console.log('');
  console.log('Optional GLOBAL-only snippet:');
  console.log(JSON.stringify(globalSnippet, null, 2));
  console.log('');
  console.log('Optional npx fallback snippet:');
  console.log(`- ${snippetPath}`);
  console.log(JSON.stringify(npxSnippet, null, 2));
}

async function main() {
  if (argv.includes('--help') || argv.includes('-h')) {
    console.log('LocalNest setup wizard');
    console.log('');
    console.log('Usage:');
    console.log('  localnest setup');
    console.log('  localnest setup --paths="/abs/path1,/abs/path2"');
    console.log('  localnest setup --roots-json=\'[{"label":"repo","path":"/abs/repo"}]\'');
    console.log('  localnest setup --package="localnest-mcp"');
    console.log('  localnest setup --skip-model-download=true');
    console.log('  localnest setup --skip-sqlite-vec-install=true');
    console.log('  localnest setup --sqlite-vec-extension="/abs/path/to/vec0.so"');
    console.log('  localnest setup --memory-enabled=true');
    console.log('  localnest setup --memory-backend=auto');
    console.log('  localnest setup --memory-db-path="/abs/path/to/memory.db"');
    console.log('  localnest setup --memory-auto-capture=true');
    console.log('  localnest setup --memory-consent-done=true');
    return;
  }

  // Extract package ref to a literal default — CodeQL CWE-532 taint break
  const envPkg = process.env.LOCALNEST_NPX_PACKAGE;
  const packageRef = parseArg('package') || (typeof envPkg === 'string' && envPkg.length > 0 ? envPkg.replace(/[^a-zA-Z0-9@/._-]/g, '') : 'localnest-mcp');
  const existingConfig = readExistingConfig();
  const existingDefaults = buildExistingDefaults(existingConfig);
  const preflight = runPreflightChecks();
  if (preflight.errors.length > 0) {
    for (const err of preflight.errors) {
      console.error(`[preflight:error] ${err}`);
    }
    process.exit(1);
  }
  for (const warning of preflight.warnings) {
    console.error(`[preflight:warning] ${warning}`);
  }

  const rootsJsonArg = parseArg('roots-json');
  const pathsArg = parseArg('paths');
  if (pathsArg || rootsJsonArg) {
    const roots = rootsJsonArg ? parseRootsFromJsonArg(rootsJsonArg) : parseRootsFromPathsArg(pathsArg);
    if (roots.length === 0) {
      throw new Error('No valid directories provided in --paths/--roots-json');
    }

    const requestedBackend = parseArg('index-backend') || existingDefaults.backend;
    const dbPath = path.resolve(expandHome(parseArg('db-path') || existingDefaults.dbPath));
    const indexPath = path.resolve(expandHome(parseArg('index-path') || existingDefaults.indexPath));
    const chunkLines = parseIntegerArg('chunk-lines', existingDefaults.chunkLines);
    const chunkOverlap = parseIntegerArg('chunk-overlap', existingDefaults.chunkOverlap);
    const maxTermsPerChunk = parseIntegerArg('max-terms-per-chunk', existingDefaults.maxTermsPerChunk);
    const maxIndexedFiles = parseIntegerArg('max-indexed-files', existingDefaults.maxIndexedFiles);
    const embeddingProvider = parseArg('embed-provider') || existingDefaults.embeddingProvider;
    const embeddingModel = parseArg('embed-model') || existingDefaults.embeddingModel;
    const embedCachePreferred = path.resolve(expandHome(parseArg('embed-cache-dir') || existingDefaults.embedCachePreferred));
    const embeddingDimensions = parseIntegerArg('embed-dims', existingDefaults.embeddingDimensions);
    const rerankerProvider = parseArg('reranker-provider') || existingDefaults.rerankerProvider;
    const rerankerModel = parseArg('reranker-model') || existingDefaults.rerankerModel;
    const rerankerCachePreferred = path.resolve(expandHome(parseArg('reranker-cache-dir') || existingDefaults.rerankerCachePreferred));
    const skipModelDownload = parseBooleanArg('skip-model-download') ?? false;
    const { embeddingCacheDir, rerankerCacheDir } = resolveModelCacheDirs(
      embedCachePreferred,
      rerankerCachePreferred
    );
    const requestedMemoryEnabled = parseBooleanArg('memory-enabled') ?? existingDefaults.memoryEnabled;
    const memoryBackend = parseArg('memory-backend') || existingDefaults.memoryBackend;
    const memoryDbPath = path.resolve(expandHome(parseArg('memory-db-path') || existingDefaults.memoryDbPath));
    const memoryAutoCapture = parseBooleanArg('memory-auto-capture') ?? existingDefaults.memoryAutoCapture;
    const memoryConsentDone = parseBooleanArg('memory-consent-done') ?? existingDefaults.memoryConsentDone;
    const compatibility = resolveCompatibleSetupOptions({
      backend: requestedBackend,
      memoryEnabled: requestedMemoryEnabled
    });
    for (const warning of compatibility.warnings) {
      process.stderr.write(`[setup] warning: ${warning}\n`);
    }
    const backend = compatibility.backend;
    const memoryEnabled = compatibility.memoryEnabled;
    const { sqliteVecExtensionPath, sqliteVecInstallStatus } = resolveSqliteVecPreference({ backend });

    saveOutputs(roots, packageRef, {
      backend,
      dbPath,
      indexPath,
      chunkLines,
      chunkOverlap,
      maxTermsPerChunk,
      maxIndexedFiles,
      sqliteVecExtensionPath,
      embedding: {
        provider: embeddingProvider,
        model: embeddingModel,
        cacheDir: embeddingCacheDir,
        dimensions: embeddingDimensions
      },
      reranker: {
        provider: rerankerProvider,
        model: rerankerModel,
        cacheDir: rerankerCacheDir
      },
      memory: {
        enabled: memoryEnabled,
        backend: memoryBackend,
        dbPath: memoryDbPath,
        autoCapture: memoryAutoCapture,
        askForConsentDone: memoryConsentDone
      }
    });
    printSuccess(packageRef, {
      backend,
      dbPath,
      indexPath,
      sqliteVecExtensionPath,
      embedding: {
        provider: embeddingProvider,
        model: embeddingModel,
        cacheDir: embeddingCacheDir,
        dimensions: embeddingDimensions
      },
      reranker: {
        provider: rerankerProvider,
        model: rerankerModel,
        cacheDir: rerankerCacheDir
      },
      memory: {
        enabled: memoryEnabled,
        backend: memoryBackend,
        dbPath: memoryDbPath
      }
    });
    if (backend === 'sqlite-vec' && !sqliteVecInstallStatus.ok) {
      process.stderr.write(`[setup] warning: sqlite-vec native extension missing: ${sqliteVecInstallStatus.reason || 'unknown reason'}\n`);
    }
    if (!skipModelDownload) {
      await warmupModels({
        embedding: {
          provider: embeddingProvider,
          model: embeddingModel,
          cacheDir: embeddingCacheDir,
          dimensions: embeddingDimensions
        },
        reranker: {
          provider: rerankerProvider,
          model: rerankerModel,
          cacheDir: rerankerCacheDir
        }
      });
    }
    return;
  }

  const rl = readline.createInterface({ input, output });
  try {
    console.log('LocalNest setup wizard');
    console.log('This will configure project/data folders and indexing backend for LocalNest MCP.');
    console.log('');

    if (existingConfig) {
      console.log(`Existing config detected: ${configPath}`);
      console.log('Press Enter to keep current values where shown.');
      console.log('');
    }

    const suggestions = collectSuggestions();
    if (suggestions.length > 0) {
      console.log('Suggested folders:');
      suggestions.forEach((s, i) => {
        console.log(`  ${i + 1}. ${s}`);
      });
      console.log('');
    }

    let roots = [...existingDefaults.roots];
    let reuseExistingRoots = false;
    if (roots.length > 0) {
      console.log('Existing roots:');
      roots.forEach((root, i) => {
        console.log(`  ${i + 1}. ${root.label}: ${root.path}`);
      });
      console.log('');
      const reuseAnswer = (await rl.question('Keep existing roots? [Y/n]: ')).trim().toLowerCase();
      reuseExistingRoots = reuseAnswer === '' || reuseAnswer === 'y' || reuseAnswer === 'yes';
      if (!reuseExistingRoots) {
        roots = [];
      }
    }

    if (!reuseExistingRoots) {
      for (let i = 0; i < suggestions.length; i += 1) {
        const answer = (await rl.question(`Add suggested folder ${i + 1} (${suggestions[i]})? [y/N]: `)).trim().toLowerCase();
        if (answer !== 'y' && answer !== 'yes') continue;

        const defaultLabel = toLabel(suggestions[i], `root${roots.length + 1}`);
        const labelInput = (await rl.question(`Label for ${suggestions[i]} [${defaultLabel}]: `)).trim();
        roots.push({
          label: labelInput || defaultLabel,
          path: suggestions[i]
        });
      }

      while (true) {
        const rawPath = (await rl.question('Add another folder path (or press Enter to finish): ')).trim();
        if (!rawPath) break;

        const resolved = path.resolve(expandHome(rawPath));
        if (!isDir(resolved)) {
          console.log(`Skipping: not a directory -> ${resolved}`);
          continue;
        }

        if (roots.some((r) => r.path === resolved)) {
          console.log(`Skipping: already added -> ${resolved}`);
          continue;
        }

        const defaultLabel = toLabel(resolved, `root${roots.length + 1}`);
        const labelInput = (await rl.question(`Label for ${resolved} [${defaultLabel}]: `)).trim();
        roots.push({
          label: labelInput || defaultLabel,
          path: resolved
        });
      }
    }

    if (roots.length === 0) {
      const fallback = cwd;
      console.log('No folders selected. Using current directory as fallback.');
      roots.push({ label: toLabel(fallback, 'cwd'), path: fallback });
    }

    console.log('');
    console.log('Index backend options:');
    console.log('1) sqlite-vec (recommended): low-resource SQLite DB, durable, future-upgradable');
    console.log('2) json: simplest file-based index (fallback compatibility mode)');
    const defaultBackendChoice = !supportsNodeSqlite() || existingDefaults.backend === 'json' ? '2' : '1';
    const backendAnswer = (await rl.question(`Choose backend [1/2] (default ${defaultBackendChoice}): `)).trim();
    const requestedBackend = backendAnswer === '2'
      ? 'json'
      : backendAnswer === '1'
        ? 'sqlite-vec'
        : (!supportsNodeSqlite() ? 'json' : existingDefaults.backend);

    const suggestedDbPath = existingDefaults.dbPath;
    const dbPathInput = (await rl.question(`SQLite DB path [${suggestedDbPath}]: `)).trim();
    const dbPath = path.resolve(expandHome(dbPathInput || suggestedDbPath));

    const suggestedIndexPath = existingDefaults.indexPath;
    const indexPathInput = (await rl.question(`JSON index path (fallback) [${suggestedIndexPath}]: `)).trim();
    const indexPath = path.resolve(expandHome(indexPathInput || suggestedIndexPath));

    const chunkLinesInput = (await rl.question(`Chunk lines [${existingDefaults.chunkLines}]: `)).trim();
    const chunkOverlapInput = (await rl.question(`Chunk overlap [${existingDefaults.chunkOverlap}]: `)).trim();
    const maxTermsInput = (await rl.question(`Max terms per chunk [${existingDefaults.maxTermsPerChunk}]: `)).trim();
    const maxFilesInput = (await rl.question(`Max indexed files [${existingDefaults.maxIndexedFiles}]: `)).trim();

    const chunkLines = Number.parseInt(chunkLinesInput || String(existingDefaults.chunkLines), 10) || existingDefaults.chunkLines;
    const chunkOverlap = Number.parseInt(chunkOverlapInput || String(existingDefaults.chunkOverlap), 10) || existingDefaults.chunkOverlap;
    const maxTermsPerChunk = Number.parseInt(maxTermsInput || String(existingDefaults.maxTermsPerChunk), 10) || existingDefaults.maxTermsPerChunk;
    const maxIndexedFiles = Number.parseInt(maxFilesInput || String(existingDefaults.maxIndexedFiles), 10) || existingDefaults.maxIndexedFiles;
    const embeddingProvider = existingDefaults.embeddingProvider;
    const embeddingModel = existingDefaults.embeddingModel;
    const embedCachePreferred = existingDefaults.embedCachePreferred;
    const embeddingDimensions = existingDefaults.embeddingDimensions;
    const rerankerProvider = existingDefaults.rerankerProvider;
    const rerankerModel = existingDefaults.rerankerModel;
    const rerankerCachePreferred = existingDefaults.rerankerCachePreferred;
    const { embeddingCacheDir, rerankerCacheDir } = resolveModelCacheDirs(
      embedCachePreferred,
      rerankerCachePreferred
    );
    console.log('');
    console.log('Local memory setup:');
    console.log('LocalNest can keep automatic local memory for future agent sessions.');
    console.log('This is opt-in and stays on your machine.');
    let memoryEnabled = supportsNodeSqlite() ? existingDefaults.memoryEnabled : false;
    let memoryConsentDone = existingDefaults.memoryConsentDone;
    if (!supportsNodeSqlite()) {
      console.log(`Node ${process.versions.node} does not support built-in node:sqlite, so LocalNest will use the json backend and disable local memory.`);
      memoryConsentDone = true;
    } else if (!existingDefaults.memoryConsentDone) {
      const memoryConsentAnswer = (await rl.question(`Enable automatic local memory capture? [${existingDefaults.memoryEnabled ? 'Y/n' : 'y/N'}]: `)).trim().toLowerCase();
      if (memoryConsentAnswer === 'y' || memoryConsentAnswer === 'yes') {
        memoryEnabled = true;
      } else if (memoryConsentAnswer === 'n' || memoryConsentAnswer === 'no') {
        memoryEnabled = false;
      }
      memoryConsentDone = true;
    } else {
      const memoryToggleAnswer = (await rl.question(`Automatic local memory is currently ${existingDefaults.memoryEnabled ? 'enabled' : 'disabled'}. Change it? [y/N]: `)).trim().toLowerCase();
      if (memoryToggleAnswer === 'y' || memoryToggleAnswer === 'yes') {
        const enableAnswer = (await rl.question(`Enable automatic local memory capture? [${existingDefaults.memoryEnabled ? 'Y/n' : 'y/N'}]: `)).trim().toLowerCase();
        if (enableAnswer === 'y' || enableAnswer === 'yes' || (enableAnswer === '' && existingDefaults.memoryEnabled)) {
          memoryEnabled = true;
        } else if (enableAnswer === 'n' || enableAnswer === 'no' || (enableAnswer === '' && !existingDefaults.memoryEnabled)) {
          memoryEnabled = false;
        }
      }
    }
    const suggestedMemoryDbPath = existingDefaults.memoryDbPath;
    const memoryDbPathInput = (await rl.question(`Memory SQLite DB path [${suggestedMemoryDbPath}]: `)).trim();
    const memoryDbPath = path.resolve(expandHome(memoryDbPathInput || suggestedMemoryDbPath));
    const compatibility = resolveCompatibleSetupOptions({
      backend: requestedBackend,
      memoryEnabled
    });
    for (const warning of compatibility.warnings) {
      process.stderr.write(`[setup] warning: ${warning}\n`);
    }
    const backend = compatibility.backend;
    memoryEnabled = compatibility.memoryEnabled;
    const { sqliteVecExtensionPath, sqliteVecInstallStatus } = resolveSqliteVecPreference({ backend });

    saveOutputs(roots, packageRef, {
      backend,
      dbPath,
      indexPath,
      chunkLines,
      chunkOverlap,
      maxTermsPerChunk,
      maxIndexedFiles,
      sqliteVecExtensionPath,
      embedding: {
        provider: embeddingProvider,
        model: embeddingModel,
        cacheDir: embeddingCacheDir,
        dimensions: embeddingDimensions
      },
      reranker: {
        provider: rerankerProvider,
        model: rerankerModel,
        cacheDir: rerankerCacheDir
      },
      memory: {
        enabled: memoryEnabled,
        backend: existingDefaults.memoryBackend,
        dbPath: memoryDbPath,
        autoCapture: memoryEnabled,
        askForConsentDone: memoryConsentDone
      }
    });
    printSuccess(packageRef, {
      backend,
      dbPath,
      indexPath,
      sqliteVecExtensionPath,
      embedding: {
        provider: embeddingProvider,
        model: embeddingModel,
        cacheDir: embeddingCacheDir,
        dimensions: embeddingDimensions
      },
      reranker: {
        provider: rerankerProvider,
        model: rerankerModel,
        cacheDir: rerankerCacheDir
      },
      memory: {
        enabled: memoryEnabled,
        backend: existingDefaults.memoryBackend,
        dbPath: memoryDbPath
      }
    });
    if (backend === 'sqlite-vec' && !sqliteVecInstallStatus.ok) {
      process.stderr.write(`[setup] warning: sqlite-vec native extension missing: ${sqliteVecInstallStatus.reason || 'unknown reason'}\n`);
    }
    await warmupModels({
      embedding: {
        provider: embeddingProvider,
        model: embeddingModel,
        cacheDir: embeddingCacheDir,
        dimensions: embeddingDimensions
      },
      reranker: {
        provider: rerankerProvider,
        model: rerankerModel,
        cacheDir: rerankerCacheDir
      }
    });
  } finally {
    rl.close();
  }
}

main().catch((error) => {
  console.error('[localnest-setup] fatal:', error?.message || error);
  process.exit(1);
});
