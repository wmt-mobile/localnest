/**
 * Ingest CLI subcommand.
 *
 *   localnest ingest <file> [--format markdown|json] [--nest <n>] [--branch <b>] [--agent-id <id>]
 *
 * Ingests a conversation file into LocalNest memory with auto-format detection.
 *
 * @module src/cli/commands/ingest
 */

import fs from 'node:fs';
import path from 'node:path';
import { buildRuntimeConfig } from '../../runtime/config.js';
import { EmbeddingService } from '../../services/retrieval/embedding/service.js';
import { MemoryService } from '../../services/memory/service.js';

/* ------------------------------------------------------------------ */
/*  Arg parsing                                                        */
/* ------------------------------------------------------------------ */

const FLAG_SCHEMA = {
  format: { alias: 'f', type: 'string' },
  nest: { alias: 'n', type: 'string' },
  branch: { alias: 'b', type: 'string' },
  'agent-id': { alias: 'a', type: 'string' },
};

/**
 * Parse flags from args array. Returns { flags, positionals }.
 */
function parseFlags(args, schema) {
  const flags = {};
  const positionals = [];
  const aliasMap = {};

  for (const [key, def] of Object.entries(schema)) {
    if (def.alias) aliasMap[def.alias] = key;
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--') {
      positionals.push(...args.slice(i + 1));
      break;
    }

    if (arg.startsWith('--')) {
      const eqIdx = arg.indexOf('=');
      let key, value;
      if (eqIdx !== -1) {
        key = arg.slice(2, eqIdx);
        value = arg.slice(eqIdx + 1);
      } else {
        key = arg.slice(2);
      }

      const def = schema[key];
      if (!def) {
        positionals.push(arg);
        continue;
      }

      if (def.type === 'boolean') {
        flags[key] = value !== undefined ? value !== 'false' : true;
      } else if (value !== undefined) {
        flags[key] = def.type === 'number' ? Number(value) : value;
      } else {
        i++;
        const next = args[i];
        flags[key] = def.type === 'number' ? Number(next) : next;
      }
      continue;
    }

    if (arg.startsWith('-') && arg.length === 2) {
      const alias = arg.slice(1);
      const mappedKey = aliasMap[alias];
      if (mappedKey) {
        const def = schema[mappedKey];
        if (def.type === 'boolean') {
          flags[mappedKey] = true;
        } else {
          i++;
          const next = args[i];
          flags[mappedKey] = def.type === 'number' ? Number(next) : next;
        }
        continue;
      }
    }

    positionals.push(arg);
  }

  return { flags, positionals };
}

/* ------------------------------------------------------------------ */
/*  Service bootstrap                                                  */
/* ------------------------------------------------------------------ */

function createMemoryService() {
  const runtime = buildRuntimeConfig();
  const embeddingService = new EmbeddingService({
    provider: runtime.embeddingProvider,
    model: runtime.embeddingModel,
    cacheDir: runtime.embeddingCacheDir,
  });
  return new MemoryService({
    localnestHome: runtime.localnestHome,
    enabled: runtime.memoryEnabled,
    backend: runtime.memoryBackend,
    dbPath: runtime.memoryDbPath,
    autoCapture: runtime.memoryAutoCapture,
    consentDone: runtime.memoryConsentDone,
    embeddingService,
  });
}

/* ------------------------------------------------------------------ */
/*  Output helpers                                                     */
/* ------------------------------------------------------------------ */

function writeJson(data) {
  process.stdout.write(JSON.stringify(data, null, 2) + '\n');
}

function writeError(msg, json) {
  if (json) {
    writeJson({ error: msg });
  } else {
    process.stderr.write(`Error: ${msg}\n`);
  }
  process.exitCode = 1;
}

/* ------------------------------------------------------------------ */
/*  Format detection                                                   */
/* ------------------------------------------------------------------ */

const MARKDOWN_EXTS = new Set(['.md', '.markdown', '.mdown', '.mkd']);
const JSON_EXTS = new Set(['.json']);

/**
 * Detect conversation format from file extension.
 * @param {string} filePath
 * @returns {'markdown'|'json'|null}
 */
function detectFormat(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (MARKDOWN_EXTS.has(ext)) return 'markdown';
  if (JSON_EXTS.has(ext)) return 'json';
  return null;
}

/* ------------------------------------------------------------------ */
/*  Main handler                                                       */
/* ------------------------------------------------------------------ */

/**
 * @param {string[]} args
 * @param {import('../options.js').GlobalOptions} opts
 */
export async function run(args, opts) {
  const { flags, positionals } = parseFlags(args, FLAG_SCHEMA);
  const target = positionals[0] || '';

  if (!target || target === 'help' || target === '--help' || target === '-h') {
    const lines = [
      '',
      '  localnest ingest <file> [options]',
      '',
      '  Ingest a conversation file into memory with auto-format detection.',
      '',
      '  Options:',
      '    --format, -f markdown|json   Override format auto-detection',
      '    --nest, -n <name>            Assign nest taxonomy',
      '    --branch, -b <name>          Assign branch taxonomy',
      '    --agent-id, -a <id>          Assign agent ID scope',
      '',
      '  Supported formats:',
      '    .md, .markdown               Markdown conversations (## Role / **Role:** / Role:)',
      '    .json                        JSON array of {role, content} objects',
      '',
    ];
    process.stdout.write(lines.join('\n') + '\n');
    return;
  }

  // Resolve file path
  const filePath = path.resolve(target);

  // Validate file exists and is readable
  if (!fs.existsSync(filePath)) {
    writeError(`File not found: ${target}`, opts.json);
    return;
  }

  try {
    fs.accessSync(filePath, fs.constants.R_OK);
  } catch {
    writeError(`File not readable: ${target}`, opts.json);
    return;
  }

  // Determine format
  let format = flags.format || null;
  if (format) {
    format = format.toLowerCase();
    if (format !== 'markdown' && format !== 'json') {
      writeError(`Invalid format "${format}". Must be "markdown" or "json".`, opts.json);
      return;
    }
  } else {
    format = detectFormat(filePath);
    if (!format) {
      writeError(
        `Cannot detect format for "${path.basename(target)}". Use --format markdown|json to specify.`,
        opts.json
      );
      return;
    }
  }

  // Bootstrap memory service
  const svc = createMemoryService();

  const ingestOpts = {
    filePath,
    nest: flags.nest || '',
    branch: flags.branch || '',
    agentId: flags['agent-id'] || '',
  };

  try {
    const result = format === 'markdown'
      ? await svc.ingestMarkdown(ingestOpts)
      : await svc.ingestJson(ingestOpts);

    if (opts.json) {
      writeJson(result);
      return;
    }

    // Handle skipped (already ingested or no turns)
    if (result.skipped) {
      if (result.reason === 'already_ingested') {
        process.stdout.write(`Already ingested: ${path.basename(filePath)}\n`);
        process.stdout.write(`  Source ID: ${result.source_id}\n`);
        process.stdout.write(`  Ingested at: ${result.ingested_at}\n`);
        process.stdout.write(`  Turns: ${result.turn_count}\n`);
      } else if (result.reason === 'no_turns_found') {
        process.stdout.write(`No conversation turns found in ${path.basename(filePath)}\n`);
        process.stdout.write('  Check that the file contains role markers (## User, **Assistant:**, etc.)\n');
      }
      return;
    }

    // Success output
    process.stdout.write(`Ingested: ${path.basename(filePath)} (${format})\n`);
    process.stdout.write(`  Turns parsed:       ${result.turn_count}\n`);
    process.stdout.write(`  Entries created:    ${result.stored_count}\n`);
    process.stdout.write(`  Duplicates skipped: ${result.dedup_skipped}\n`);
    process.stdout.write(`  Entities extracted: ${result.entities_extracted}\n`);
    process.stdout.write(`  Triples created:    ${result.triples_created}\n`);

    if (ingestOpts.nest) process.stdout.write(`  Nest:               ${ingestOpts.nest}\n`);
    if (ingestOpts.branch) process.stdout.write(`  Branch:             ${ingestOpts.branch}\n`);
    if (ingestOpts.agentId) process.stdout.write(`  Agent ID:           ${ingestOpts.agentId}\n`);
    if (result.source_id) process.stdout.write(`  Source ID:          ${result.source_id}\n`);

    if (result.errors && result.errors.length > 0) {
      process.stdout.write(`  Errors:             ${result.errors.length}\n`);
      for (const e of result.errors.slice(0, 5)) {
        process.stdout.write(`    Turn ${e.turn_index}: ${e.error}\n`);
      }
    }
  } catch (err) {
    writeError(err.message || String(err), opts.json);
  }
}
