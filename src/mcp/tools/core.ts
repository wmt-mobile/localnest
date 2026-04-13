import { z } from 'zod';
import {
  normalizeUpdateSelfResult,
  normalizeUpdateStatus
} from '../common/response-normalizers.js';
import type { RegisterJsonToolFn } from '../common/tool-utils.js';
import type { ServerStatus } from '../common/status.js';
import { buildHelpGuide } from '../common/status.js';

interface UpdateService {
  getStatus(opts: { force: boolean; channel?: string }): Promise<unknown>;
  selfUpdate(opts: {
    approvedByUser: boolean;
    dryRun: boolean;
    version: string;
    reinstallSkill: boolean;
  }): Promise<unknown>;
}

interface HealthReport {
  checked_at: string;
  issues: string[];
  warnings: string[];
  actions: string[];
  ok: boolean;
}

export interface RegisterCoreToolsOptions {
  registerJsonTool: RegisterJsonToolFn;
  buildServerStatus: () => Promise<ServerStatus>;
  buildUsageGuide: () => unknown;
  updates: UpdateService;
  getLastHealthReport: (() => HealthReport | null) | null;
}

export function registerCoreTools({
  registerJsonTool,
  buildServerStatus,
  buildUsageGuide,
  updates,
  getLastHealthReport
}: RegisterCoreToolsOptions): void {
  registerJsonTool(
    'localnest_server_status',
    {
      title: 'Server Status',
      description: 'Return runtime status and active configuration summary for this MCP server.',
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async () => buildServerStatus()
  );

  registerJsonTool(
    'localnest_health',
    {
      title: 'Health',
      description: 'Return a compact runtime health summary for fast smoke checks.',
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async () => {
      const status = await buildServerStatus();
      return {
        name: status.name,
        version: status.version,
        mode: status.mode,
        health: status.health,
        roots_count: Array.isArray(status.roots) ? status.roots.length : 0,
        update_recommendation: (status.updates as Record<string, unknown>)?.recommendation || 'up_to_date',
        background_health: getLastHealthReport?.() ?? null
      };
    }
  );

  registerJsonTool(
    'localnest_usage_guide',
    {
      title: 'Usage Guide',
      description: 'Return concise best-practice guidance for users and AI agents using this MCP.',
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async () => buildUsageGuide()
  );

  registerJsonTool(
    'localnest_help',
    {
      title: 'Help',
      description: 'Get task-scoped tool guidance. Describe what you want to do and receive a tailored list of tools, workflow steps, and tips.',
      inputSchema: {
        task: z.string().max(500).default('')
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async ({ task }: Record<string, unknown>) => buildHelpGuide(task as string)
  );

  registerJsonTool(
    ['localnest_update_status'],
    {
      title: 'Update Status',
      description: 'Check npm for the latest localnest-mcp version on the selected channel (cached, default every 120 minutes).',
      inputSchema: {
        force_check: z.boolean().default(false),
        channel: z.enum(['stable', 'beta']).default('stable')
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async ({ force_check, channel }: Record<string, unknown>) => normalizeUpdateStatus(
      await updates.getStatus({ force: force_check as boolean, channel: channel as string })
    )
  );

  registerJsonTool(
    ['localnest_update_self'],
    {
      title: 'Update Self',
      description: 'Update localnest-mcp globally via npm and sync bundled skill. Supports stable, beta, or explicit version targets. Requires explicit user approval.',
      inputSchema: {
        approved_by_user: z.boolean().default(false),
        dry_run: z.boolean().default(false),
        version: z.string().default('latest'),
        reinstall_skill: z.boolean().default(true)
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async ({ approved_by_user, dry_run, version, reinstall_skill }: Record<string, unknown>) => normalizeUpdateSelfResult(
      await updates.selfUpdate({
        approvedByUser: approved_by_user as boolean,
        dryRun: dry_run as boolean,
        version: version as string,
        reinstallSkill: reinstall_skill as boolean
      })
    )
  );
}
