import { z } from 'zod';

export const RESPONSE_SCHEMA_VERSION = '1.0';

/**
 * Shared MCP tool annotation constants — MCP 2025-06-18 spec.
 *
 * These lift the inlined annotation blocks from individual tool registration
 * files (39-RESEARCH.md § "Justification for lifting" counts:
 *   READ_ONLY appears ~38 times across 8 files,
 *   WRITE appears ~11 times across 4 files,
 *   IDEMPOTENT_WRITE appears ~7 times across 3 files,
 *   DESTRUCTIVE appears 5 times across 2 files).
 *
 * Naming note (CONTEXT.md drift — Claude's Discretion):
 *   CONTEXT.md originally specified READ_ONLY / WRITE / DELETE. This file
 *   exports four constants with two renames/additions:
 *     - DELETE_ANNOTATIONS → DESTRUCTIVE_ANNOTATIONS (bucket also covers
 *       update_self and memory_remove_relation, which are destructive but
 *       not deletes; name mirrors the MCP SDK `destructiveHint` field).
 *     - IDEMPOTENT_WRITE_ANNOTATIONS is a new fourth bucket for dedup-upsert
 *       writes (kg_add_triples_batch, kg_add_entity, ingest_*, etc.) —
 *       destructive=false, readOnly=false, idempotent=true.
 *   See Plan 39-01 <constant_naming_rationale> for full justification.
 *
 * Source: MCP SDK ToolAnnotationsSchema (node_modules/@modelcontextprotocol/sdk
 * dist/esm/types.js:1173-1207). Spec defaults are counter-intuitive
 * (destructiveHint defaults to `true`, readOnlyHint defaults to `false`), so
 * every tool MUST set all four fields explicitly — never rely on defaults.
 */

/** Pure read tools (search, get, list, status, query, timeline, tree, ...). */
export const READ_ONLY_ANNOTATIONS = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false
} as const;

/** Additive writes that are NOT idempotent (each call creates new state: memory_store, diary_write, capture_outcome, teach, kg_add_triple single). */
export const WRITE_ANNOTATIONS = {
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
  openWorldHint: false
} as const;

/** Additive writes that ARE idempotent (upserts dedup and return existing id: kg_add_entity, kg_add_triples_batch, ingest_*, kg_invalidate, kg_backfill_links, project_backfill, memory_add_relation). */
export const IDEMPOTENT_WRITE_ANNOTATIONS = {
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false
} as const;

/** Destructive tools (every *_delete* + memory_remove_relation; update_self also destructive but keeps openWorldHint:true inline). idempotentHint: true because re-deleting a gone row is a no-op. */
export const DESTRUCTIVE_ANNOTATIONS = {
  readOnlyHint: false,
  destructiveHint: true,
  idempotentHint: true,
  openWorldHint: false
} as const;

function renderMarkdown(value: unknown, heading: string = 'Result'): string {
  if (value === null || value === undefined) {
    return `## ${heading}\n\nnull`;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return `## ${heading}\n\n- (empty)`;
    const preview = value
      .map((item) => `- \`${JSON.stringify(item)}\``)
      .join('\n');
    return `## ${heading}\n\n${preview}`;
  }
  if (typeof value === 'object') {
    const lines = Object.entries(value as Record<string, unknown>).map(([key, innerValue]) => (
      `- **${key}**: \`${typeof innerValue === 'string' ? innerValue : JSON.stringify(innerValue)}\``
    ));
    return `## ${heading}\n\n${lines.join('\n')}`;
  }
  return `## ${heading}\n\n${String(value)}`;
}

export interface ToolResponseOptions {
  meta?: Record<string, unknown> | null;
  note?: string;
}

export interface ToolResponsePayload {
  __localnest_tool_response: true;
  data: unknown;
  meta: Record<string, unknown> | null;
  note: string;
}

export function createToolResponse(data: unknown, { meta = null, note = '' }: ToolResponseOptions = {}): ToolResponsePayload {
  return {
    __localnest_tool_response: true,
    data,
    meta,
    note
  };
}

interface NormalizedPayload {
  data: unknown;
  meta: Record<string, unknown> | null;
  note: string;
}

function normalizeToolResponsePayload(result: unknown): NormalizedPayload {
  if (result && typeof result === 'object' && (result as ToolResponsePayload).__localnest_tool_response) {
    const payload = result as ToolResponsePayload;
    return {
      data: payload.data,
      meta: payload.meta || null,
      note: payload.note || ''
    };
  }

  return {
    data: result,
    meta: null,
    note: ''
  };
}

interface ToolResult {
  structuredContent: { data: unknown; meta: Record<string, unknown> };
  content: Array<{ type: string; text: string }>;
}

function toolResult(result: unknown, responseFormat: string = 'json', markdownTitle: string = 'Result'): ToolResult {
  const { data, meta, note } = normalizeToolResponsePayload(result);
  const mergedMeta: Record<string, unknown> = {
    schema_version: RESPONSE_SCHEMA_VERSION,
    ...(meta || {})
  };
  const text = responseFormat === 'markdown'
    ? `${note ? `${note}\n\n` : ''}${renderMarkdown(data, markdownTitle)}`
    : `${note ? `${note}\n\n` : ''}${JSON.stringify(data, null, 2)}`;
  return {
    structuredContent: { data, meta: mergedMeta },
    content: [{ type: 'text', text }]
  };
}

export interface PaginatedResult<T> {
  total_count: number;
  count: number;
  limit: number;
  offset: number;
  has_more: boolean;
  next_offset: number | null;
  items: T[];
}

export function paginateItems<T>(items: T[], limit: number | undefined, offset: number | undefined): PaginatedResult<T> {
  const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.min(1000, limit!)) : 100;
  const safeOffset = Number.isFinite(offset) ? Math.max(0, offset!) : 0;
  const totalCount = items.length;
  const paged = items.slice(safeOffset, safeOffset + safeLimit);
  const nextOffset = safeOffset + safeLimit;
  return {
    total_count: totalCount,
    count: paged.length,
    limit: safeLimit,
    offset: safeOffset,
    has_more: nextOffset < totalCount,
    next_offset: nextOffset < totalCount ? nextOffset : null,
    items: paged
  };
}

export function buildRipgrepHelpMessage(): string {
  let install: string;
  if (process.platform === 'win32') {
    install = 'Install ripgrep: winget install BurntSushi.ripgrep.MSVC';
  } else if (process.platform === 'darwin') {
    install = 'Install ripgrep: brew install ripgrep';
  } else {
    install = 'Install ripgrep: sudo apt-get install ripgrep';
  }

  return [
    'ripgrep (rg) is required by localnest-mcp for fast code search.',
    install,
    'If rg is installed but MCP still fails, set PATH in your MCP client env.',
    'Run doctor for detailed checks: localnest doctor'
  ].join(' ');
}

type ToolHandler = (args: Record<string, unknown>, extra: unknown) => Promise<unknown>;

interface ToolDefinition {
  title: string;
  description: string;
  inputSchema: Record<string, z.ZodTypeAny>;
  annotations?: Record<string, unknown>;
  markdownTitle?: string;
}

interface McpServer {
  registerTool(
    name: string,
    options: {
      title: string;
      description: string;
      inputSchema: Record<string, z.ZodTypeAny>;
      outputSchema: { data: z.ZodTypeAny; meta: z.ZodTypeAny };
      annotations?: Record<string, unknown>;
    },
    handler: (args: Record<string, unknown>, extra: unknown) => Promise<ToolResult>
  ): void;
}

export type RegisterJsonToolFn = (
  names: string | string[],
  definition: ToolDefinition,
  handler: ToolHandler
) => void;

export function createJsonToolRegistrar(server: McpServer, responseFormatSchema: z.ZodTypeAny): RegisterJsonToolFn {
  return function registerJsonTool(
    names: string | string[],
    { title, description, inputSchema, annotations, markdownTitle }: ToolDefinition,
    handler: ToolHandler
  ): void {
    const canonical = Array.isArray(names) ? names[0] : names;
    const schema = {
      ...inputSchema,
      response_format: responseFormatSchema
    };

    server.registerTool(
      canonical,
      {
        title,
        description,
        inputSchema: schema,
        outputSchema: {
          data: z.any(),
          meta: z.any().optional()
        },
        annotations
      },
      async (args: Record<string, unknown>, extra: unknown) => {
        const incoming = args || {};
        const responseFormat = (incoming.response_format as string) || 'json';
        const toolArgs = { ...incoming };
        delete toolArgs.response_format;
        const data = await handler(toolArgs, extra);
        return toolResult(data, responseFormat, markdownTitle || title);
      }
    );
  };
}
