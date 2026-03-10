import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { resolveBundledSkillDir } from '../scripts/runtime/install-localnest-skill.mjs';

test('resolveBundledSkillDir points at packaged top-level skills directory', () => {
  const fakeMetaUrl = pathToFileURL(
    path.join(process.cwd(), 'scripts', 'runtime', 'install-localnest-skill.mjs')
  ).href;

  const resolved = resolveBundledSkillDir(fakeMetaUrl);

  assert.equal(
    resolved,
    path.join(process.cwd(), 'skills', 'localnest-mcp')
  );
});

test('bundled skill metadata version matches package version', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
  const skill = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'skills', 'localnest-mcp', '.localnest-skill.json'), 'utf8')
  );

  assert.equal(skill.version, pkg.version);
});
