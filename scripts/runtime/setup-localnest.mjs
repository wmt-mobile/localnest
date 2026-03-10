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
const localnestHome = resolveLocalnestHome(process.env);
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

  const majorNode = Number.parseInt(process.versions.node.split('.')[0] || '0', 10);
  if (!Number.isFinite(majorNode) || majorNode < 18) {
    errors.push(`Node.js 18+ is required. Current: ${process.versions.node}`);
  }

  const hasGlobal = commandExists(getGlobalCommand());
  const hasNpx = commandExists(getNpxCommand());
  if (!hasGlobal && !hasNpx) {
    errors.push('Neither localnest-mcp nor npx is available. Install LocalNest globally or fix Node.js/npm and retry.');
  }

  if (!commandExists('rg')) {
    errors.push('ripgrep (rg) is required for efficient search. Install it and re-run setup.');
  }

  return { errors };
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

function resolveModelCacheDirs(preferredEmbedDir, preferredRerankerDir) {
  const embed = resolveWritableModelCacheDir({
    preferredDir: preferredEmbedDir,
    localnestHome,
    env: process.env
  });
  const reranker = resolveWritableModelCacheDir({
    preferredDir: preferredRerankerDir,
    localnestHome,
    env: process.env
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
    env: process.env,
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

  const packageRef = parseArg('package') || process.env.LOCALNEST_NPX_PACKAGE || 'localnest-mcp';
  const preflight = runPreflightChecks();
  if (preflight.errors.length > 0) {
    for (const err of preflight.errors) {
      console.error(`[preflight:error] ${err}`);
    }
    process.exit(1);
  }

  const rootsJsonArg = parseArg('roots-json');
  const pathsArg = parseArg('paths');
  if (pathsArg || rootsJsonArg) {
    const roots = rootsJsonArg ? parseRootsFromJsonArg(rootsJsonArg) : parseRootsFromPathsArg(pathsArg);
    if (roots.length === 0) {
      throw new Error('No valid directories provided in --paths/--roots-json');
    }

    const backend = parseArg('index-backend') || 'sqlite-vec';
    const dbPath = path.resolve(expandHome(parseArg('db-path') || defaultDbPath));
    const indexPath = path.resolve(expandHome(parseArg('index-path') || defaultJsonIndexPath));
    const chunkLines = parseIntegerArg('chunk-lines', 60);
    const chunkOverlap = parseIntegerArg('chunk-overlap', 15);
    const maxTermsPerChunk = parseIntegerArg('max-terms-per-chunk', 80);
    const maxIndexedFiles = parseIntegerArg('max-indexed-files', 20000);
    const embeddingProvider = parseArg('embed-provider') || 'huggingface';
    const embeddingModel = parseArg('embed-model') || 'sentence-transformers/all-MiniLM-L6-v2';
    const embedCachePreferred = path.resolve(expandHome(parseArg('embed-cache-dir') || layout.dirs.cache));
    const embeddingDimensions = parseIntegerArg('embed-dims', 384);
    const rerankerProvider = parseArg('reranker-provider') || 'huggingface';
    const rerankerModel = parseArg('reranker-model') || 'cross-encoder/ms-marco-MiniLM-L-6-v2';
    const rerankerCachePreferred = path.resolve(expandHome(parseArg('reranker-cache-dir') || layout.dirs.cache));
    const skipModelDownload = parseBooleanArg('skip-model-download') ?? false;
    const { embeddingCacheDir, rerankerCacheDir } = resolveModelCacheDirs(
      embedCachePreferred,
      rerankerCachePreferred
    );
    const memoryEnabled = parseBooleanArg('memory-enabled') ?? false;
    const memoryBackend = parseArg('memory-backend') || 'auto';
    const memoryDbPath = path.resolve(expandHome(parseArg('memory-db-path') || defaultMemoryDbPath));
    const memoryAutoCapture = parseBooleanArg('memory-auto-capture') ?? memoryEnabled;
    const memoryConsentDone = parseBooleanArg('memory-consent-done') ?? false;
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

    const suggestions = collectSuggestions();
    if (suggestions.length > 0) {
      console.log('Suggested folders:');
      suggestions.forEach((s, i) => {
        console.log(`  ${i + 1}. ${s}`);
      });
      console.log('');
    }

    const roots = [];

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

    if (roots.length === 0) {
      const fallback = cwd;
      console.log('No folders selected. Using current directory as fallback.');
      roots.push({ label: toLabel(fallback, 'cwd'), path: fallback });
    }

    console.log('');
    console.log('Index backend options:');
    console.log('1) sqlite-vec (recommended): low-resource SQLite DB, durable, future-upgradable');
    console.log('2) json: simplest file-based index (fallback compatibility mode)');
    const backendAnswer = (await rl.question('Choose backend [1/2] (default 1): ')).trim();
    const backend = backendAnswer === '2' ? 'json' : 'sqlite-vec';

    const suggestedDbPath = defaultDbPath;
    const dbPathInput = (await rl.question(`SQLite DB path [${suggestedDbPath}]: `)).trim();
    const dbPath = path.resolve(expandHome(dbPathInput || suggestedDbPath));

    const suggestedIndexPath = defaultJsonIndexPath;
    const indexPathInput = (await rl.question(`JSON index path (fallback) [${suggestedIndexPath}]: `)).trim();
    const indexPath = path.resolve(expandHome(indexPathInput || suggestedIndexPath));

    const chunkLinesInput = (await rl.question('Chunk lines [60]: ')).trim();
    const chunkOverlapInput = (await rl.question('Chunk overlap [15]: ')).trim();
    const maxTermsInput = (await rl.question('Max terms per chunk [80]: ')).trim();
    const maxFilesInput = (await rl.question('Max indexed files [20000]: ')).trim();

    const chunkLines = Number.parseInt(chunkLinesInput || '60', 10) || 60;
    const chunkOverlap = Number.parseInt(chunkOverlapInput || '15', 10) || 15;
    const maxTermsPerChunk = Number.parseInt(maxTermsInput || '80', 10) || 80;
    const maxIndexedFiles = Number.parseInt(maxFilesInput || '20000', 10) || 20000;
    const embeddingProvider = 'huggingface';
    const embeddingModel = 'sentence-transformers/all-MiniLM-L6-v2';
    const embedCachePreferred = layout.dirs.cache;
    const embeddingDimensions = 384;
    const rerankerProvider = 'huggingface';
    const rerankerModel = 'cross-encoder/ms-marco-MiniLM-L-6-v2';
    const rerankerCachePreferred = layout.dirs.cache;
    const { embeddingCacheDir, rerankerCacheDir } = resolveModelCacheDirs(
      embedCachePreferred,
      rerankerCachePreferred
    );
    const { sqliteVecExtensionPath, sqliteVecInstallStatus } = resolveSqliteVecPreference({ backend });

    console.log('');
    console.log('Local memory setup:');
    console.log('LocalNest can keep automatic local memory for future agent sessions.');
    console.log('This is opt-in and stays on your machine.');
    const memoryConsentAnswer = (await rl.question('Enable automatic local memory capture? [y/N]: ')).trim().toLowerCase();
    const memoryEnabled = memoryConsentAnswer === 'y' || memoryConsentAnswer === 'yes';
    const suggestedMemoryDbPath = defaultMemoryDbPath;
    const memoryDbPathInput = (await rl.question(`Memory SQLite DB path [${suggestedMemoryDbPath}]: `)).trim();
    const memoryDbPath = path.resolve(expandHome(memoryDbPathInput || suggestedMemoryDbPath));

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
        backend: 'auto',
        dbPath: memoryDbPath,
        autoCapture: memoryEnabled,
        askForConsentDone: true
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
        backend: 'auto',
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
