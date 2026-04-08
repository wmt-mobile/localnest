#!/usr/bin/env node
import { forwardDeprecatedCommand } from './_shared.js';

await forwardDeprecatedCommand({
  metaUrl: import.meta.url,
  legacyCommand: 'localnest-mcp-upgrade',
  replacementCommand: 'localnest upgrade',
  commandArgs: ['upgrade']
});
