#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, 'reports');
const REPORT_PATH = path.join(REPORT_DIR, 'localnest-installed-beta5-release-test-report.md');
const PROJECT_PATH = ROOT;
const FILE_PATH = path.join(ROOT, 'README.md');

class McpStdioClient {
  constructor(command, args, env) {
    this.command = command;
    this.args = args;
    this.env = env;
    this.child = null;
    this.buffer = '';
    this.nextId = 1;
    this.pending = new Map();
    this.stderr = '';
  }

  async start() {
    this.child = spawn(this.command, this.args, {
      env: this.env,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    this.child.stdout.on('data', (chunk) => {
      this.buffer += chunk.toString('utf8');
      this.#drainBuffer();
    });
    this.child.stderr.on('data', (chunk) => {
      this.stderr += chunk.toString('utf8');
    });
    this.child.on('exit', (code, signal) => {
      for (const pending of this.pending.values()) {
        pending.reject(new Error(`MCP process exited before response (code=${code}, signal=${signal})`));
      }
      this.pending.clear();
    });

    const init = await this.request('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'localnest-release-smoke',
        version: '1.0.0'
      }
    }, 10000);
    await this.notify('notifications/initialized', {});
    return init;
  }

  async request(method, params = {}, timeoutMs = 30000) {
    const id = this.nextId += 1;
    const payload = {
      jsonrpc: '2.0',
      id,
      method,
      params
    };
    const message = `${JSON.stringify(payload)}\n`;

    const promise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Timeout waiting for ${method}`));
      }, timeoutMs);
      this.pending.set(id, {
        resolve: (value) => {
          clearTimeout(timeout);
          resolve(value);
        },
        reject: (error) => {
          clearTimeout(timeout);
          reject(error);
        }
      });
    });

    this.child.stdin.write(message);
    return promise;
  }

  async notify(method, params = {}) {
    const payload = {
      jsonrpc: '2.0',
      method,
      params
    };
    const message = `${JSON.stringify(payload)}\n`;
    this.child.stdin.write(message);
  }

  async close() {
    if (!this.child) return;
    this.child.kill('SIGTERM');
  }

  #drainBuffer() {
    while (true) {
      const lineEnd = this.buffer.indexOf('\n');
      if (lineEnd === -1) return;
      const body = this.buffer.slice(0, lineEnd).replace(/\r$/, '');
      this.buffer = this.buffer.slice(lineEnd + 1);

      let message;
      try {
        message = JSON.parse(body);
      } catch {
        continue;
      }
      if (Object.prototype.hasOwnProperty.call(message, 'id') && this.pending.has(message.id)) {
        const pending = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) {
          pending.reject(new Error(`${message.error.message || 'Unknown MCP error'}`));
        } else {
          pending.resolve(message.result);
        }
      }
    }
  }
}

function summarize(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value.slice(0, 160);
  const text = JSON.stringify(value);
  return text.length > 220 ? `${text.slice(0, 220)}...` : text;
}

function nowIso() {
  return new Date().toISOString();
}

function safeToolResult(result) {
  if (!result) return null;
  if (result.structuredContent?.data !== undefined) return result.structuredContent.data;
  if (result.content?.[0]?.text) return result.content[0].text;
  return result;
}

async function main() {
  fs.mkdirSync(REPORT_DIR, { recursive: true });

  const env = {
    ...process.env,
    MCP_MODE: 'stdio',
    LOCALNEST_CONFIG: '/home/jenil-d-gohel/.localnest/config/localnest.config.json',
    LOCALNEST_INDEX_BACKEND: 'sqlite-vec',
    LOCALNEST_DB_PATH: '/home/jenil-d-gohel/.localnest/data/localnest.db',
    LOCALNEST_INDEX_PATH: '/home/jenil-d-gohel/.localnest/data/localnest.index.json',
    LOCALNEST_MEMORY_ENABLED: 'true',
    LOCALNEST_MEMORY_BACKEND: 'auto',
    LOCALNEST_MEMORY_DB_PATH: '/home/jenil-d-gohel/.localnest/data/localnest.memory.db'
  };

  const client = new McpStdioClient('localnest-mcp', [], env);
  const results = [];
  let toolList = [];
  let tempMemoryA = null;
  let tempMemoryB = null;

  const record = async (name, fn, options = {}) => {
    const startedAt = Date.now();
    try {
      const value = await fn();
      const durationMs = Date.now() - startedAt;
      results.push({
        name,
        status: 'PASS',
        durationMs,
        details: options.details ? options.details(value) : summarize(value)
      });
      return value;
    } catch (error) {
      const durationMs = Date.now() - startedAt;
      results.push({
        name,
        status: options.allowFailure ? 'WARN' : 'FAIL',
        durationMs,
        details: error?.message || String(error)
      });
      if (!options.allowFailure) throw error;
      return null;
    }
  };

  try {
    const initialize = await record('MCP initialize', async () => client.start(), {
      details: (value) => `${value.serverInfo?.name || 'unknown'} ${value.serverInfo?.version || ''}`.trim()
    });

    const toolsListResult = await record('tools/list', async () => client.request('tools/list', {}, 15000), {
      details: (value) => `${value.tools?.length || 0} tools exposed`
    });
    toolList = toolsListResult.tools || [];

    const callTool = (name, args = {}, timeoutMs = 30000) =>
      client.request('tools/call', { name, arguments: args }, timeoutMs);

    await record('localnest_server_status', async () => safeToolResult(await callTool('localnest_server_status')), {
      details: (value) => `version=${value.version}, roots=${value.roots?.length || 0}, backend=${value.vector_index?.backend || value.vector_index?.requested_backend || ''}`
    });
    await record('localnest_usage_guide', async () => safeToolResult(await callTool('localnest_usage_guide', { response_format: 'markdown' })), {
      details: (value) => typeof value === 'string' ? 'markdown returned' : summarize(value)
    });
    await record('localnest_list_roots', async () => safeToolResult(await callTool('localnest_list_roots')), {
      details: (value) => `${value.items?.length || 0} roots`
    });
    await record('localnest_list_projects', async () => safeToolResult(await callTool('localnest_list_projects', { root_path: path.dirname(PROJECT_PATH) })), {
      details: (value) => `${value.items?.length || 0} first-level projects`
    });
    await record('localnest_project_tree', async () => safeToolResult(await callTool('localnest_project_tree', { project_path: PROJECT_PATH, max_depth: 2 })), {
      details: (value) => `${value.entries?.length || 0} top-level entries`
    });
    await record('localnest_index_status', async () => safeToolResult(await callTool('localnest_index_status')), {
      details: (value) => `backend=${value.backend}, total_files=${value.total_files}`
    });
    await record('localnest_embed_status', async () => safeToolResult(await callTool('localnest_embed_status')), {
      details: (value) => `ready=${value.ready ?? ''}, provider=${value.provider || ''}`
    });
    await record('localnest_index_project', async () => safeToolResult(await callTool('localnest_index_project', {
      project_path: PROJECT_PATH
    }, 120000)), {
      details: (value) => `indexed_files=${value.indexed_files}, failed_files=${value.failed_files?.length || 0}`
    });
    await record('localnest_search_files', async () => safeToolResult(await callTool('localnest_search_files', {
      project_path: PROJECT_PATH,
      query: 'localnest-mcp',
      max_results: 10
    })), {
      details: (value) => `${value.items?.length || value.count || 0} matches`
    });
    await record('localnest_search_code', async () => safeToolResult(await callTool('localnest_search_code', {
      project_path: PROJECT_PATH,
      query: 'localnest-mcp',
      max_results: 5,
      context_lines: 1
    })), {
      details: (value) => `${value.items?.length || value.count || 0} matches`
    });
    await record('localnest_search_hybrid', async () => safeToolResult(await callTool('localnest_search_hybrid', {
      project_path: PROJECT_PATH,
      query: 'memory workflow',
      max_results: 5,
      auto_index: false
    }, 60000)), {
      details: (value) => `ranking_mode=${value.ranking_mode || ''}, results=${value.results?.length || 0}`
    });
    await record('localnest_get_symbol', async () => safeToolResult(await callTool('localnest_get_symbol', {
      project_path: PROJECT_PATH,
      symbol: 'buildRuntimeConfig',
      max_results: 5
    })), {
      details: (value) => `definitions=${value.definitions?.length || 0}, exports=${value.exports?.length || 0}`
    });
    await record('localnest_find_usages', async () => safeToolResult(await callTool('localnest_find_usages', {
      project_path: PROJECT_PATH,
      symbol: 'buildRuntimeConfig',
      max_results: 10
    })), {
      details: (value) => `usages=${value.usages?.length || 0}`
    });
    await record('localnest_read_file', async () => safeToolResult(await callTool('localnest_read_file', {
      path: FILE_PATH,
      start_line: 1,
      end_line: 20
    })), {
      details: (value) => `${value.lines?.length || 0} lines returned`
    });
    await record('localnest_summarize_project', async () => safeToolResult(await callTool('localnest_summarize_project', {
      project_path: PROJECT_PATH
    }, 60000)), {
      details: (value) => summarize(value.summary || value)
    });

    await record('localnest_memory_status', async () => safeToolResult(await callTool('localnest_memory_status')), {
      details: (value) => `enabled=${value.enabled}, backend=${value.selected_backend || value.requested_backend || ''}`
    });
    await record('localnest_task_context', async () => safeToolResult(await callTool('localnest_task_context', {
      task: 'installed beta 5 release test',
      project_path: PROJECT_PATH,
      limit: 5
    })), {
      details: (value) => `recall=${value.recall?.count || 0}`
    });
    await record('localnest_memory_recall', async () => safeToolResult(await callTool('localnest_memory_recall', {
      query: 'release smoke test',
      project_path: PROJECT_PATH,
      limit: 5
    })), {
      details: (value) => `count=${value.count || value.items?.length || 0}`
    });

    tempMemoryA = await record('localnest_memory_store A', async () => safeToolResult(await callTool('localnest_memory_store', {
      title: 'beta5 release smoke temp A',
      summary: 'temporary memory for release smoke test',
      content: 'temporary memory A created during installed beta5 release smoke test',
      kind: 'knowledge',
      status: 'active',
      scope: { project_path: PROJECT_PATH },
      tags: ['release-test', 'temp']
    })), {
      details: (value) => `id=${value.id}`
    });

    tempMemoryB = await record('localnest_memory_store B', async () => safeToolResult(await callTool('localnest_memory_store', {
      title: 'beta5 release smoke temp B',
      summary: 'temporary related memory for release smoke test',
      content: 'temporary memory B created during installed beta5 release smoke test',
      kind: 'knowledge',
      status: 'active',
      scope: { project_path: PROJECT_PATH },
      tags: ['release-test', 'temp']
    })), {
      details: (value) => `id=${value.id}`
    });

    await record('localnest_memory_list', async () => safeToolResult(await callTool('localnest_memory_list', {
      project_path: PROJECT_PATH,
      limit: 10
    })), {
      details: (value) => `count=${value.count || value.items?.length || 0}`
    });
    await record('localnest_memory_get', async () => safeToolResult(await callTool('localnest_memory_get', {
      id: tempMemoryA.id
    })), {
      details: (value) => `title=${value.title}`
    });
    await record('localnest_memory_update', async () => safeToolResult(await callTool('localnest_memory_update', {
      id: tempMemoryA.id,
      summary: 'updated temporary memory for release smoke test',
      change_note: 'release smoke update'
    })), {
      details: (value) => `id=${value.id}`
    });
    await record('localnest_memory_suggest_relations', async () => safeToolResult(await callTool('localnest_memory_suggest_relations', {
      id: tempMemoryA.id,
      threshold: 0.0,
      max_results: 5
    }, 60000)), {
      details: (value) => `suggestions=${value.suggestions?.length || 0}`
    });
    await record('localnest_memory_add_relation', async () => safeToolResult(await callTool('localnest_memory_add_relation', {
      source_id: tempMemoryA.id,
      target_id: tempMemoryB.id,
      relation_type: 'related'
    })), {
      details: (value) => `${value.source_id} -> ${value.target_id}`
    });
    await record('localnest_memory_related', async () => safeToolResult(await callTool('localnest_memory_related', {
      id: tempMemoryA.id
    })), {
      details: (value) => `related=${value.count || value.related?.length || 0}`
    });
    await record('localnest_memory_remove_relation', async () => safeToolResult(await callTool('localnest_memory_remove_relation', {
      source_id: tempMemoryA.id,
      target_id: tempMemoryB.id
    })), {
      details: (value) => `removed=${value.removed}`
    });
    await record('localnest_memory_capture_event', async () => safeToolResult(await callTool('localnest_memory_capture_event', {
      event_type: 'task',
      status: 'completed',
      title: 'beta5 release smoke event',
      summary: 'temporary event for installed beta5 release smoke test',
      scope: { project_path: PROJECT_PATH }
    })), {
      details: (value) => `status=${value.status || value.result?.status || ''}`
    });
    await record('localnest_memory_events', async () => safeToolResult(await callTool('localnest_memory_events', {
      project_path: PROJECT_PATH,
      limit: 5
    })), {
      details: (value) => `count=${value.count || value.items?.length || 0}`
    });
    await record('localnest_capture_outcome', async () => safeToolResult(await callTool('localnest_capture_outcome', {
      task: 'installed beta5 release smoke',
      summary: 'tool capture outcome executed',
      project_path: PROJECT_PATH,
      files_changed: 0,
      has_tests: true
    })), {
      details: (value) => `captured=${value.captured}`
    });

    await record('localnest_update_status', async () => safeToolResult(await callTool('localnest_update_status', {
      force_check: false
    }, 20000)), {
      allowFailure: true,
      details: (value) => `current=${value.current || ''}, latest=${value.latest || ''}, outdated=${value.is_outdated ?? ''}`
    });

    results.push({
      name: 'localnest_update_self',
      status: 'SKIP',
      durationMs: 0,
      details: 'Skipped in release sweep because self-update mutates the installed global runtime.'
    });

    if (tempMemoryA?.id) {
      await record('localnest_memory_delete A', async () => safeToolResult(await callTool('localnest_memory_delete', {
        id: tempMemoryA.id
      })), {
        details: (value) => `deleted=${value.deleted}`
      });
    }
    if (tempMemoryB?.id) {
      await record('localnest_memory_delete B', async () => safeToolResult(await callTool('localnest_memory_delete', {
        id: tempMemoryB.id
      })), {
        details: (value) => `deleted=${value.deleted}`
      });
    }

    const passCount = results.filter((item) => item.status === 'PASS').length;
    const warnCount = results.filter((item) => item.status === 'WARN').length;
    const failCount = results.filter((item) => item.status === 'FAIL').length;
    const skipCount = results.filter((item) => item.status === 'SKIP').length;

    const report = [
      '# LocalNest Installed Beta.5 Release Test Report',
      '',
      `Date: ${nowIso()}`,
      `Host: ${os.hostname()}`,
      `Project: ${PROJECT_PATH}`,
      `Installed runtime: ${initialize.serverInfo?.name || 'localnest'} ${initialize.serverInfo?.version || 'unknown'}`,
      '',
      '## Scope',
      '',
      '- Target runtime: globally installed `localnest-mcp`',
      '- Version under test: `0.0.4-beta.5`',
      '- Transport: MCP stdio handshake against installed binary',
      '- Config: `/home/jenil-d-gohel/.localnest/config/localnest.config.json`',
      '',
      '## Summary',
      '',
      `- PASS: ${passCount}`,
      `- WARN: ${warnCount}`,
      `- FAIL: ${failCount}`,
      `- SKIP: ${skipCount}`,
      `- Exposed MCP tools: ${toolList.length}`,
      '',
      '## Results',
      '',
      '| Check | Status | Details |',
      '|---|---|---|',
      ...results.map((item) => `| ${item.name} | ${item.status} | ${String(item.details).replace(/\|/g, '\\|')} |`),
      '',
      '## Notes',
      '',
      '- `localnest_update_self` was intentionally skipped because it mutates the live global install and is not appropriate for a release verification sweep.',
      '- Memory store/update/relation/delete flow was exercised against the real installed memory backend, then cleaned up for the temporary entries created by this test.',
      '- Event-based workflow tools create history entries by design; those are not deleted by this sweep.',
      '',
      '## Stderr',
      '',
      '```text',
      client.stderr.trim() || '(none)',
      '```'
    ].join('\n');

    fs.writeFileSync(REPORT_PATH, `${report}\n`, 'utf8');
    process.stdout.write(`${report}\n`);
  } finally {
    try {
      await client.close();
    } catch {}
  }
}

main().catch((error) => {
  process.stderr.write(`[release-test-installed-beta5] fatal: ${error?.stack || error?.message || String(error)}\n`);
  process.exit(1);
});
