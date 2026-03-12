#!/usr/bin/env node
import { forwardDeprecatedCommand } from './_shared.js';

await forwardDeprecatedCommand({
  metaUrl: import.meta.url,
  legacyCommand: 'localnest-mcp-capture-outcome',
  replacementCommand: 'localnest capture-outcome'
});
