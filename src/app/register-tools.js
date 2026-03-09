import {
  DEFAULT_MAX_READ_LINES,
  DEFAULT_MAX_RESULTS,
  SERVER_NAME,
  SERVER_VERSION
} from '../runtime/config.js';
} from '../runtime/index.js';
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
  registerRetrievalTools
} from '../mcp/index.js';
import { MemoryWorkflowService } from '../services/memory/index.js';

export function registerAppTools(server, runtime, services) {
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
    getRuntimeSummary: async () => buildServerStatus()
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
    updates: services.updates
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
    defaultMaxResults: DEFAULT_MAX_RESULTS
  });
}
