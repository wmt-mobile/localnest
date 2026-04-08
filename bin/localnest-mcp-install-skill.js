#!/usr/bin/env node
import { forwardDeprecatedCommand } from './_shared.js';

await forwardDeprecatedCommand({
  metaUrl: import.meta.url,
  legacyCommand: 'localnest-mcp-install-skill',
  replacementCommand: 'localnest skill install',
  commandArgs: ['skill', 'install']
});
