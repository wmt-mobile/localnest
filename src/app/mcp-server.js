#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  SERVER_NAME,
  SERVER_VERSION,
  applyConsolePolicy,
  buildRuntimeConfig
} from '../runtime/config.js';
import { installRuntimeWarningFilter } from '../runtime/warning-filter.js';
import { buildRipgrepHelpMessage } from '../mcp/common/tool-utils.js';
import { startStalenessMonitor } from '../mcp/common/staleness-monitor.js';
import { createServices } from './create-services.js';
import { registerAppTools } from './register-tools.js';

if (!process.env.DART_SUPPRESS_ANALYTICS) {
  process.env.DART_SUPPRESS_ANALYTICS = 'true';
}

installRuntimeWarningFilter();

async function main() {
  const runtime = buildRuntimeConfig(process.env);
  applyConsolePolicy(runtime.disableConsoleOutput);

  if (runtime.mcpMode !== 'stdio') {
    throw new Error('Unsupported MCP_MODE. Use MCP_MODE=stdio for MCP clients.');
  }

  const services = await createServices(runtime);
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION
  });

  registerAppTools(server, runtime, services);

  if (!runtime.hasRipgrep) {
    process.stderr.write(
      `[localnest-mcp] warning: ripgrep (rg) not found — search_code and search_hybrid ` +
      `will use slower JS fallback. ${buildRipgrepHelpMessage()}\n`
    );
  }

  services.updates.warmCheck().catch((error) => {
    process.stderr.write(`[localnest-update] warm check failed: ${error?.message || error}\n`);
  });

  startStalenessMonitor(services.vectorIndex, runtime.indexSweepIntervalMinutes);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('[localnest-mcp] fatal:', error);
  process.exit(1);
});
