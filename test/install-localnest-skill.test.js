import test from 'node:test';
import assert from 'node:assert/strict';
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
