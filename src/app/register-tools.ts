import {
  DEFAULT_MAX_READ_LINES,
  DEFAULT_MAX_RESULTS
} from '../runtime/config.js';
import { SERVER_NAME, SERVER_VERSION } from '../runtime/version.js';
import {
  RESPONSE_FORMAT_SCHEMA,
  MEMORY_KIND_SCHEMA,
  MEMORY_STATUS_SCHEMA,
  MEMORY_SCOPE_SCHEMA,
  MEMORY_LINK_SCHEMA,
  MEMORY_EVENT_TYPE_SCHEMA,
  MEMORY_EVENT_STATUS_SCHEMA
} from '../mcp/index.js';
import {
  createJsonToolRegistrar,
  paginateItems,
  createServerStatusBuilder,
  buildUsageGuide,
  registerCoreTools,
  registerMemoryWorkflowTools,
  registerMemoryStoreTools,
  registerRetrievalTools,
  registerGraphTools,
  registerBackfillTools,
  registerFindTools,
  registerAuditTools,
  registerSymbolTools
} from '../mcp/index.js';
import { MemoryWorkflowService } from '../services/memory/index.js';
import type { AppServices } from './create-services.js';

export function registerAppTools(server: any, runtime: any, services: any): void {
  const registerJsonTool = createJsonToolRegistrar(server, RESPONSE_FORMAT_SCHEMA);
  const buildServerStatus = createServerStatusBuilder({
    serverName: SERVER_NAME,
    serverVersion: SERVER_VERSION,
    runtime,
    workspace: services.workspace,
    memory: services.memory,
    updates: services.updates,
    getActiveIndexBackend: services.getActiveIndexBackend,
    vectorIndex: services.vectorIndex
  });
  const memoryWorkflow = new MemoryWorkflowService({
    memory: services.memory,
    getRuntimeSummary: async () => buildServerStatus(),
    search: services.search
  });
  const sharedSchemas = {
    MEMORY_KIND_SCHEMA,
    MEMORY_STATUS_SCHEMA,
    MEMORY_SCOPE_SCHEMA,
    MEMORY_LINK_SCHEMA,
    MEMORY_EVENT_TYPE_SCHEMA,
    MEMORY_EVENT_STATUS_SCHEMA
  };

  registerCoreTools({
    registerJsonTool,
    buildServerStatus,
    buildUsageGuide,
    updates: services.updates,
    getLastHealthReport: services.getLastHealthReport ?? (() => null)
  });

  registerMemoryWorkflowTools({
    registerJsonTool,
    schemas: sharedSchemas,
    memory: services.memory,
    memoryWorkflow
  });

  registerMemoryStoreTools({
    registerJsonTool,
    schemas: sharedSchemas,
    memory: services.memory
  });

  registerRetrievalTools({
    registerJsonTool,
    paginateItems,
    workspace: services.workspace,
    vectorIndex: services.vectorIndex,
    search: services.search,
    defaultMaxReadLines: DEFAULT_MAX_READ_LINES,
    defaultMaxResults: DEFAULT_MAX_RESULTS,
    memory: services.memory
  });

  registerGraphTools({
    registerJsonTool,
    schemas: sharedSchemas,
    memory: services.memory
  });

  registerBackfillTools({
    registerJsonTool,
    memory: services.memory
  });

  registerFindTools({
    registerJsonTool,
    memory: services.memory,
    search: services.search
  });

  registerAuditTools({
    registerJsonTool,
    memory: services.memory
  });

  registerSymbolTools({
    registerJsonTool,
    search: services.search
  });
}
