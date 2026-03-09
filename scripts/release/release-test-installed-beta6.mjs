#!/usr/bin/env node

import path from 'node:path';
import { runInstalledRuntimeReleaseTest } from './release-test-installed-runtime.mjs';

const root = process.cwd();
const reportDir = path.join(root, 'reports');

runInstalledRuntimeReleaseTest({
  versionLabel: '0.0.4-beta.6',
  runtimeLabel: 'globally installed `localnest-mcp`',
  markdownReportPath: path.join(reportDir, 'localnest-installed-beta6-release-test-report.md'),
  jsonReportPath: path.join(reportDir, 'localnest-installed-beta6-release-test-report.json')
}).catch((error) => {
  process.stderr.write(`[release-test-installed-beta6] fatal: ${error?.stack || error?.message || String(error)}\n`);
  process.exit(1);
});
