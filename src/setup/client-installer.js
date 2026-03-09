import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function backupFile(filePath, backupDir, toolId) {
  if (!fs.existsSync(filePath)) return null;
  ensureDir(backupDir);
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `${toolId}-${stamp}-${path.basename(filePath)}.bak`);
  fs.copyFileSync(filePath, backupPath);
  return backupPath;
}

function serializeTomlString(value) {
  return JSON.stringify(String(value));
}

function serializeTomlArray(values) {
  return `[${values.map((value) => serializeTomlString(value)).join(', ')}]`;
}

function buildCodexLocalnestBlock(serverConfig) {
  const lines = [
    '[mcp_servers.localnest]',
    `command = ${serializeTomlString(serverConfig.command)}`
  ];

  if (Array.isArray(serverConfig.args) && serverConfig.args.length > 0) {
    lines.push(`args = ${serializeTomlArray(serverConfig.args)}`);
  }
  if (typeof serverConfig.startup_timeout_sec === 'number') {
    lines.push(`startup_timeout_sec = ${serverConfig.startup_timeout_sec}`);
  }

  const env = isPlainObject(serverConfig.env) ? serverConfig.env : {};
  if (Object.keys(env).length > 0) {
    lines.push('');
    lines.push('[mcp_servers.localnest.env]');
    for (const key of Object.keys(env).sort()) {
      lines.push(`${key} = ${serializeTomlString(env[key])}`);
    }
  }

  return `${lines.join('\n')}\n`;
}

function upsertCodexLocalnestBlock(rawText, block) {
  const lines = rawText.split(/\r?\n/);
  const kept = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (/^\[mcp_servers\.localnest(?:\.[^\]]+)?\]\s*$/.test(line)) {
      i += 1;
      while (i < lines.length && !/^\[/.test(lines[i])) {
        i += 1;
      }
      i -= 1;
      continue;
    }
    kept.push(line);
  }

  const trimmed = kept.join('\n').replace(/\s+$/, '');
  if (!trimmed) return block;
  return `${trimmed}\n\n${block}`;
}

function installIntoJsonTarget(target, serverConfig, backupDir) {
  ensureDir(path.dirname(target.configPath));
  const existed = fs.existsSync(target.configPath);
  const backupPath = backupFile(target.configPath, backupDir, target.id);

  let parsed = {};
  if (existed) {
    parsed = JSON.parse(fs.readFileSync(target.configPath, 'utf8'));
    if (!isPlainObject(parsed)) {
      throw new Error(`Expected JSON object in ${target.configPath}`);
    }
  }

  const mcpServers = isPlainObject(parsed.mcpServers) ? parsed.mcpServers : {};
  const previous = mcpServers.localnest;
  const changed = JSON.stringify(previous) !== JSON.stringify(serverConfig);
  const next = {
    ...parsed,
    mcpServers: {
      ...mcpServers,
      localnest: serverConfig
    }
  };

  fs.writeFileSync(target.configPath, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  return {
    tool: target.label,
    toolId: target.id,
    configPath: target.configPath,
    status: existed && previous ? (changed ? 'updated' : 'unchanged') : 'installed',
    backupPath
  };
}

function installIntoCodexTarget(target, serverConfig, backupDir) {
  ensureDir(path.dirname(target.configPath));
  const existed = fs.existsSync(target.configPath);
  const backupPath = backupFile(target.configPath, backupDir, target.id);
  const rawText = existed ? fs.readFileSync(target.configPath, 'utf8') : '';
  const block = buildCodexLocalnestBlock(serverConfig);
  const nextText = upsertCodexLocalnestBlock(rawText, block);
  const changed = rawText !== nextText;

  fs.writeFileSync(target.configPath, nextText, 'utf8');
  return {
    tool: target.label,
    toolId: target.id,
    configPath: target.configPath,
    status: existed && rawText
      ? (changed ? 'updated' : 'unchanged')
      : 'installed',
    backupPath
  };
}

export function buildLocalnestServerConfig({ command, args, env }) {
  const config = {
    command,
    startup_timeout_sec: 30,
    env: { ...env }
  };
  if (Array.isArray(args) && args.length > 0) {
    config.args = [...args];
  }
  return config;
}

export function detectAiToolTargets({ homeDir = os.homedir() } = {}) {
  const candidates = [
    {
      id: 'codex',
      label: 'Codex',
      kind: 'toml',
      configPath: path.join(homeDir, '.codex', 'config.toml'),
      present: fs.existsSync(path.join(homeDir, '.codex'))
    },
    {
      id: 'cursor',
      label: 'Cursor',
      kind: 'json',
      configPath: path.join(homeDir, '.cursor', 'mcp.json'),
      present: fs.existsSync(path.join(homeDir, '.cursor'))
    },
    {
      id: 'windsurf',
      label: 'Windsurf',
      kind: 'json',
      configPath: path.join(homeDir, '.windsurf', 'mcp.json'),
      present: fs.existsSync(path.join(homeDir, '.windsurf'))
    },
    {
      id: 'windsurf-codeium',
      label: 'Windsurf (Codeium)',
      kind: 'json',
      configPath: path.join(homeDir, '.codeium', 'windsurf', 'mcp_config.json'),
      present: fs.existsSync(path.join(homeDir, '.codeium', 'windsurf'))
    },
    {
      id: 'gemini',
      label: 'Gemini CLI',
      kind: 'json',
      configPath: path.join(homeDir, '.gemini', 'antigravity', 'mcp_config.json'),
      present: fs.existsSync(path.join(homeDir, '.gemini'))
    },
    {
      id: 'kiro',
      label: 'Kiro',
      kind: 'json',
      configPath: path.join(homeDir, '.kiro', 'settings', 'mcp.json'),
      present: fs.existsSync(path.join(homeDir, '.kiro'))
    },
    {
      id: 'claude',
      label: 'Claude Code',
      kind: 'unsupported',
      present: fs.existsSync(path.join(homeDir, '.claude')) || fs.existsSync(path.join(homeDir, '.claude.json')),
      reason: 'No stable standalone MCP config file was detected for safe automatic edits.'
    },
    {
      id: 'continue',
      label: 'Continue',
      kind: 'unsupported',
      present: fs.existsSync(path.join(homeDir, '.continue')),
      reason: 'No MCP config file was detected; only the skills directory is present.'
    },
    {
      id: 'cline',
      label: 'Cline',
      kind: 'unsupported',
      present: fs.existsSync(path.join(homeDir, '.cline')),
      reason: 'No MCP config file was detected; only the skills directory is present.'
    },
    {
      id: 'roo',
      label: 'Roo',
      kind: 'unsupported',
      present: fs.existsSync(path.join(homeDir, '.roo')),
      reason: 'No MCP config file was detected for this installation.'
    },
    {
      id: 'opencode',
      label: 'OpenCode',
      kind: 'unsupported',
      present: fs.existsSync(path.join(homeDir, '.opencode')),
      reason: 'No MCP config file was detected for this installation.'
    }
  ];

  return {
    supported: candidates.filter((item) => item.present && item.kind !== 'unsupported'),
    unsupported: candidates.filter((item) => item.present && item.kind === 'unsupported')
  };
}

export function installLocalnestIntoDetectedClients({
  homeDir = os.homedir(),
  serverConfig,
  backupDir
}) {
  const detection = detectAiToolTargets({ homeDir });
  const results = [];

  for (const target of detection.supported) {
    if (target.kind === 'json') {
      results.push(installIntoJsonTarget(target, serverConfig, backupDir));
      continue;
    }
    if (target.kind === 'toml') {
      results.push(installIntoCodexTarget(target, serverConfig, backupDir));
    }
  }

  return {
    installed: results,
    unsupported: detection.unsupported
  };
}
