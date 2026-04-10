import { z } from 'zod';
import type { RegisterJsonToolFn } from '../common/tool-utils.js';

interface MemoryService {
  scanAndBackfillProjects(opts: Record<string, unknown>): Promise<unknown>;
}

export interface RegisterBackfillToolsOptions {
  registerJsonTool: RegisterJsonToolFn;
  memory: MemoryService;
}

export function registerBackfillTools({
  registerJsonTool,
  memory
}: RegisterBackfillToolsOptions): void {
  registerJsonTool(
    ['localnest_project_backfill'],
    {
      title: 'Project Backfill',
      description: 'Scan a directory for projects and create seed memory entries for those with zero existing memories. Detects package.json, Cargo.toml, go.mod, pyproject.toml, pom.xml, build.gradle, and .git. Use dry_run=true to preview without writing.',
      inputSchema: {
        root_path: z.string().min(1).max(1000),
        dry_run: z.boolean().default(false)
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async ({ root_path, dry_run }: Record<string, unknown>) =>
      memory.scanAndBackfillProjects({ rootPath: root_path, dryRun: dry_run })
  );
}
