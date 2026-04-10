import { z } from 'zod';
import {
  normalizeCaptureOutcomeResult,
  normalizeMemoryRecallResult,
  normalizeMemoryStatus,
  normalizeTaskContextResult
} from '../common/response-normalizers.js';
import { toMinimalWriteResponse } from '../common/terse-utils.js';
import type { RegisterJsonToolFn } from '../common/tool-utils.js';
import type {
  MemoryKind,
  MemoryLink,
  MemoryEventType,
  MemoryEventStatus
} from '../common/schemas.js';

interface MemoryService {
  getStatus(): Promise<unknown>;
  recall(opts: Record<string, unknown>): Promise<unknown>;
}

interface MemoryWorkflowService {
  getTaskContext(args: Record<string, unknown>): Promise<unknown>;
  captureOutcome(args: Record<string, unknown>): Promise<unknown>;
}

interface SharedSchemas {
  MEMORY_KIND_SCHEMA: z.ZodType<MemoryKind>;
  MEMORY_LINK_SCHEMA: z.ZodType<MemoryLink>;
  MEMORY_EVENT_TYPE_SCHEMA: z.ZodType<MemoryEventType>;
  MEMORY_EVENT_STATUS_SCHEMA: z.ZodType<MemoryEventStatus>;
}

export interface RegisterMemoryWorkflowToolsOptions {
  registerJsonTool: RegisterJsonToolFn;
  schemas: SharedSchemas;
  memory: MemoryService;
  memoryWorkflow: MemoryWorkflowService;
}

export function registerMemoryWorkflowTools({
  registerJsonTool,
  schemas,
  memory,
  memoryWorkflow
}: RegisterMemoryWorkflowToolsOptions): void {
  const {
    MEMORY_KIND_SCHEMA,
    MEMORY_LINK_SCHEMA,
    MEMORY_EVENT_TYPE_SCHEMA,
    MEMORY_EVENT_STATUS_SCHEMA
  } = schemas;

  registerJsonTool(
    ['localnest_task_context'],
    {
      title: 'Task Context',
      description: 'Bundle runtime status, memory state, and relevant recall for a non-trivial task in one call.',
      inputSchema: {
        query: z.string().optional(),
        task: z.string().optional(),
        root_path: z.string().optional(),
        project_path: z.string().optional(),
        branch_name: z.string().optional(),
        topic: z.string().optional(),
        feature: z.string().optional(),
        kind: MEMORY_KIND_SCHEMA.optional(),
        limit: z.number().int().min(1).max(20).default(8)
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false
      }
    },
    async (args: Record<string, unknown>) => normalizeTaskContextResult(await memoryWorkflow.getTaskContext(args), args)
  );

  registerJsonTool(
    ['localnest_memory_status'],
    {
      title: 'Memory Status',
      description: 'Return local memory feature status, consent state, and backend compatibility.',
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async () => normalizeMemoryStatus(await memory.getStatus())
  );

  registerJsonTool(
    ['localnest_memory_recall'],
    {
      title: 'Memory Recall',
      description: 'Recall the most relevant local memories for a task or query.',
      inputSchema: {
        query: z.string().min(1),
        root_path: z.string().optional(),
        project_path: z.string().optional(),
        branch_name: z.string().optional(),
        topic: z.string().optional(),
        feature: z.string().optional(),
        kind: MEMORY_KIND_SCHEMA.optional(),
        limit: z.number().int().min(1).max(50).default(10)
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false
      }
    },
    async ({ query, root_path, project_path, branch_name, topic, feature, kind, limit }: Record<string, unknown>) => normalizeMemoryRecallResult(
      await memory.recall({
        query,
        rootPath: root_path,
        projectPath: project_path,
        branchName: branch_name,
        topic,
        feature,
        kind,
        limit
      }),
      query as string
    )
  );

  registerJsonTool(
    ['localnest_capture_outcome'],
    {
      title: 'Capture Outcome',
      description: 'Capture a meaningful task outcome into the memory event pipeline with a simpler payload.',
      inputSchema: {
        task: z.string().optional(),
        title: z.string().optional(),
        summary: z.string().optional(),
        details: z.string().optional(),
        content: z.string().optional(),
        event_type: MEMORY_EVENT_TYPE_SCHEMA,
        status: MEMORY_EVENT_STATUS_SCHEMA.optional(),
        kind: MEMORY_KIND_SCHEMA.optional(),
        importance: z.number().int().min(0).max(100).optional(),
        confidence: z.number().min(0).max(1).optional(),
        files_changed: z.number().int().min(0).max(10000).default(0),
        has_tests: z.boolean().default(false),
        tags: z.array(z.string()).max(50).default([]),
        links: z.array(MEMORY_LINK_SCHEMA).max(50).default([]),
        root_path: z.string().optional(),
        project_path: z.string().optional(),
        branch_name: z.string().optional(),
        topic: z.string().optional(),
        feature: z.string().optional(),
        nest: z.string().max(200).optional(),
        branch: z.string().max(200).optional(),
        source_ref: z.string().max(1000).default(''),
        terse: z.enum(['minimal', 'verbose']).default('verbose')
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false
      }
    },
    async ({ terse, ...args }: Record<string, unknown>) => toMinimalWriteResponse(normalizeCaptureOutcomeResult(await memoryWorkflow.captureOutcome(args)), terse as string)
  );
}
