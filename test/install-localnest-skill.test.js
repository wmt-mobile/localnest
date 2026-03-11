import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  getKnownToolSkillDirs,
  getKnownProjectSkillDirs,
  listBundledSkillDirs,
  resolveBundledSkillDir,
  resolveInstallTarget
} from '../scripts/runtime/install-localnest-skill.mjs';

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

test('listBundledSkillDirs discovers all bundled skills', () => {
  const fakeMetaUrl = pathToFileURL(
    path.join(process.cwd(), 'scripts', 'runtime', 'install-localnest-skill.mjs')
  ).href;

  const resolved = listBundledSkillDirs(fakeMetaUrl).map((entry) => path.basename(entry));

  assert.ok(resolved.includes('localnest-mcp'));
  assert.ok(resolved.includes('localnest-sql-adapter'));
  assert.ok(resolved.includes('localnest-mcp-runtime'));
  assert.ok(resolved.includes('localnest-node-compat'));
});

test('bundled skill metadata version matches package version', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
  const skill = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'skills', 'localnest-mcp', '.localnest-skill.json'), 'utf8')
  );

  assert.equal(skill.version, pkg.version);
});

test('known skill install locations include codex and Claude-style skill directories', () => {
  const dirs = getKnownToolSkillDirs('/tmp/localnest-home');

  assert.deepEqual(dirs, [
    path.join('/tmp/localnest-home', '.codex', 'skills'),
    path.join('/tmp/localnest-home', '.copilot', 'skills'),
    path.join('/tmp/localnest-home', '.claude', 'skills'),
    path.join('/tmp/localnest-home', '.cline', 'skills'),
    path.join('/tmp/localnest-home', '.continue', 'skills')
  ]);
});

test('known project skill locations include github and claude layouts', () => {
  const dirs = getKnownProjectSkillDirs('/tmp/project');

  assert.deepEqual(dirs, [
    path.join('/tmp/project', '.github', 'skills'),
    path.join('/tmp/project', '.claude', 'skills')
  ]);
});

test('resolveInstallTarget defaults to agents skill dir', () => {
  const target = resolveInstallTarget({
    homeDir: '/tmp/localnest-home',
    cwd: '/tmp/project',
    skillName: 'localnest-sql-adapter'
  });

  assert.equal(target, path.join('/tmp/localnest-home', '.agents', 'skills', 'localnest-sql-adapter'));
});

test('resolveInstallTarget supports project-local Claude skill layout', () => {
  const target = resolveInstallTarget({
    homeDir: '/tmp/localnest-home',
    cwd: '/tmp/project',
    project: true,
    skillName: 'localnest-node-compat'
  });

  assert.equal(target, path.join('/tmp/project', '.claude', 'skills', 'localnest-node-compat'));
});

test('resolveInstallTarget supports explicit destination override', () => {
  const target = resolveInstallTarget({
    homeDir: '/tmp/localnest-home',
    cwd: '/tmp/project',
    dest: '/tmp/custom/skills/localnest-mcp'
  });

  assert.equal(target, '/tmp/custom/skills/localnest-mcp');
});
