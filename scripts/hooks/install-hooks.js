#!/usr/bin/env node
// Install LocalNest hooks into Claude Code settings.json
//
// Usage: node scripts/hooks/install-hooks.js
//   or:  localnest hooks install (future CLI command)
//
// Adds pre-tool and post-tool hooks that auto-retrieve and auto-save
// memory context during AI coding sessions.

const fs = require('fs');
const path = require('path');
const os = require('os');

const HOOKS_DIR = path.dirname(require.resolve('./localnest-pre-tool.js'));
const SETTINGS_PATH = path.join(os.homedir(), '.claude', 'settings.json');
const PRE_HOOK_PATH = path.join(HOOKS_DIR, 'localnest-pre-tool.js');
const POST_HOOK_PATH = path.join(HOOKS_DIR, 'localnest-post-tool.js');

function readSettings() {
  try {
    return JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'));
  } catch {
    return {};
  }
}

function writeSettings(settings) {
  fs.mkdirSync(path.dirname(SETTINGS_PATH), { recursive: true });
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2) + '\n', 'utf8');
}

function hasLocalnestHook(hookArray, scriptName) {
  if (!Array.isArray(hookArray)) return false;
  return hookArray.some(entry =>
    entry.hooks?.some(h => h.command?.includes(scriptName))
  );
}

function main() {
  const settings = readSettings();
  if (!settings.hooks) settings.hooks = {};

  let changed = false;

  // Pre-tool hook
  if (!settings.hooks.PreToolUse) settings.hooks.PreToolUse = [];
  if (!hasLocalnestHook(settings.hooks.PreToolUse, 'localnest-pre-tool')) {
    settings.hooks.PreToolUse.push({
      matcher: 'Edit|Write|Bash|MultiEdit',
      hooks: [{
        type: 'command',
        command: `node "${PRE_HOOK_PATH}"`,
        timeout: 8
      }]
    });
    changed = true;
    console.log('[localnest] Added pre-tool hook (memory context retrieval)');
  }

  // Post-tool hook
  if (!settings.hooks.PostToolUse) settings.hooks.PostToolUse = [];
  if (!hasLocalnestHook(settings.hooks.PostToolUse, 'localnest-post-tool')) {
    settings.hooks.PostToolUse.push({
      matcher: 'Bash|Edit|Write|MultiEdit',
      hooks: [{
        type: 'command',
        command: `node "${POST_HOOK_PATH}"`,
        timeout: 8
      }]
    });
    changed = true;
    console.log('[localnest] Added post-tool hook (outcome capture + diary)');
  }

  if (changed) {
    writeSettings(settings);
    console.log(`[localnest] Hooks installed in ${SETTINGS_PATH}`);
  } else {
    console.log('[localnest] Hooks already installed');
  }
}

main();
