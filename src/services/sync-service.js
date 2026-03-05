import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { pipeline } from 'node:stream/promises';
import { createReadStream, createWriteStream } from 'node:fs';
import { buildLocalnestPaths } from '../home-layout.js';

const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const GOOGLE_DRIVE_FILES_ENDPOINT = 'https://www.googleapis.com/drive/v3/files';
const GOOGLE_DRIVE_UPLOAD_ENDPOINT = 'https://www.googleapis.com/upload/drive/v3/files';
const GOOGLE_DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function isoStamp() {
  return new Date().toISOString().replaceAll(':', '-');
}

function sha256File(filePath) {
  const hash = crypto.createHash('sha256');
  const input = fs.readFileSync(filePath);
  hash.update(input);
  return hash.digest('hex');
}

function toBase64(buffer) {
  return Buffer.from(buffer).toString('base64');
}

function fromBase64(value) {
  return Buffer.from(String(value || ''), 'base64');
}

function runOrThrow(command, args, label) {
  const run = spawnSync(command, args, { stdio: 'inherit' });
  if (run.error) throw new Error(`${label} failed: ${run.error.message || run.error}`);
  if (run.status !== 0) throw new Error(`${label} failed with exit code ${run.status}`);
}

function commandExists(command, args = ['--version']) {
  const run = spawnSync(command, args, { stdio: 'ignore' });
  return run.status === 0;
}

function deriveKey(passphrase, saltB64, iterations) {
  return crypto.pbkdf2Sync(
    passphrase,
    fromBase64(saltB64),
    iterations,
    32,
    'sha256'
  );
}

function resolveCryptoKey({ keyB64, passphrase, saltB64, iterations }) {
  if (keyB64) return fromBase64(keyB64);
  if (!passphrase) {
    throw new Error('Missing encryption key/passphrase for sync.');
  }
  return deriveKey(passphrase, saltB64, iterations);
}

export async function encryptFile({
  inputPath,
  outputPath,
  keyB64,
  passphrase,
  saltB64,
  iterations
}) {
  const key = resolveCryptoKey({ keyB64, passphrase, saltB64, iterations });
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  await pipeline(createReadStream(inputPath), cipher, createWriteStream(outputPath));
  const tag = cipher.getAuthTag();
  return {
    iv: toBase64(iv),
    tag: toBase64(tag),
    sha256: sha256File(outputPath),
    sizeBytes: fs.statSync(outputPath).size
  };
}

export async function decryptFile({
  inputPath,
  outputPath,
  keyB64,
  passphrase,
  saltB64,
  iterations,
  ivB64,
  tagB64
}) {
  const key = resolveCryptoKey({ keyB64, passphrase, saltB64, iterations });
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, fromBase64(ivB64));
  decipher.setAuthTag(fromBase64(tagB64));
  await pipeline(createReadStream(inputPath), decipher, createWriteStream(outputPath));
  return {
    sha256: sha256File(outputPath),
    sizeBytes: fs.statSync(outputPath).size
  };
}

export class SyncService {
  constructor({
    localnestHome,
    fetchImpl = globalThis.fetch
  }) {
    if (!fetchImpl) {
      throw new Error('Fetch API is unavailable on this Node runtime.');
    }
    this.fetchImpl = fetchImpl;
    this.paths = buildLocalnestPaths(localnestHome);
    this.syncConfigPath = path.join(this.paths.dirs.config, 'sync.localnest.json');
    this.syncStatusPath = path.join(this.paths.dirs.cache, 'sync-status.json');
    this.syncBackupsDir = path.join(this.paths.dirs.backups, 'sync');
  }

  readSyncConfig() {
    if (!fs.existsSync(this.syncConfigPath)) return null;
    const parsed = JSON.parse(fs.readFileSync(this.syncConfigPath, 'utf8'));
    return parsed && typeof parsed === 'object' ? parsed : null;
  }

  writeSyncConfig(config) {
    ensureDir(this.paths.dirs.config);
    fs.writeFileSync(this.syncConfigPath, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
  }

  readSyncStatus() {
    if (!fs.existsSync(this.syncStatusPath)) return null;
    const parsed = JSON.parse(fs.readFileSync(this.syncStatusPath, 'utf8'));
    return parsed && typeof parsed === 'object' ? parsed : null;
  }

  writeSyncStatus(status) {
    ensureDir(this.paths.dirs.cache);
    fs.writeFileSync(this.syncStatusPath, `${JSON.stringify(status, null, 2)}\n`, 'utf8');
  }

  ensureSyncPrereqs() {
    if (!commandExists('tar')) {
      throw new Error('tar command is required for sync snapshot/restore.');
    }
    ensureDir(this.paths.dirs.config);
    ensureDir(this.paths.dirs.data);
    ensureDir(this.paths.dirs.cache);
    ensureDir(this.syncBackupsDir);
  }

  async getAccessToken(config) {
    const body = new URLSearchParams();
    body.set('client_id', config.google.clientId);
    if (config.google.clientSecret) {
      body.set('client_secret', config.google.clientSecret);
    }
    body.set('refresh_token', config.google.refreshToken);
    body.set('grant_type', 'refresh_token');

    const response = await this.fetchImpl(GOOGLE_TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Google token refresh failed (${response.status}): ${text}`);
    }
    const payload = await response.json();
    if (!payload.access_token) {
      throw new Error('Google token refresh response missing access_token');
    }
    return payload.access_token;
  }

  async driveRequest(accessToken, url, options = {}) {
    const headers = new Headers(options.headers || {});
    headers.set('authorization', `Bearer ${accessToken}`);
    const response = await this.fetchImpl(url, {
      ...options,
      headers
    });
    return response;
  }

  async findDriveFileByName(accessToken, name) {
    const query = encodeURIComponent(`name='${name}' and 'appDataFolder' in parents and trashed=false`);
    const url = `${GOOGLE_DRIVE_FILES_ENDPOINT}?spaces=appDataFolder&q=${query}&fields=files(id,name,modifiedTime,size)`;
    const response = await this.driveRequest(accessToken, url);
    if (!response.ok) {
      throw new Error(`Drive list failed (${response.status}): ${await response.text()}`);
    }
    const payload = await response.json();
    return Array.isArray(payload.files) && payload.files.length > 0 ? payload.files[0] : null;
  }

  async uploadDriveFile({ accessToken, name, contentType, buffer }) {
    const metadata = {
      name,
      parents: ['appDataFolder']
    };
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([buffer], { type: contentType }), name);

    const response = await this.driveRequest(
      accessToken,
      `${GOOGLE_DRIVE_UPLOAD_ENDPOINT}?uploadType=multipart&fields=id,name,modifiedTime,size`,
      {
        method: 'POST',
        body: form
      }
    );
    if (!response.ok) {
      throw new Error(`Drive upload failed (${response.status}): ${await response.text()}`);
    }
    return response.json();
  }

  async updateDriveFile({ accessToken, fileId, contentType, buffer }) {
    const response = await this.driveRequest(
      accessToken,
      `${GOOGLE_DRIVE_UPLOAD_ENDPOINT}/${fileId}?uploadType=media&fields=id,name,modifiedTime,size`,
      {
        method: 'PATCH',
        headers: { 'content-type': contentType },
        body: buffer
      }
    );
    if (!response.ok) {
      throw new Error(`Drive update failed (${response.status}): ${await response.text()}`);
    }
    return response.json();
  }

  async upsertDriveJsonFile({ accessToken, name, payload }) {
    const existing = await this.findDriveFileByName(accessToken, name);
    const body = Buffer.from(JSON.stringify(payload, null, 2), 'utf8');
    if (!existing) {
      return this.uploadDriveFile({
        accessToken,
        name,
        contentType: 'application/json',
        buffer: body
      });
    }
    return this.updateDriveFile({
      accessToken,
      fileId: existing.id,
      contentType: 'application/json',
      buffer: body
    });
  }

  async downloadDriveFile(accessToken, fileId) {
    const response = await this.driveRequest(
      accessToken,
      `${GOOGLE_DRIVE_FILES_ENDPOINT}/${fileId}?alt=media`,
      { method: 'GET' }
    );
    if (!response.ok) {
      throw new Error(`Drive download failed (${response.status}): ${await response.text()}`);
    }
    return Buffer.from(await response.arrayBuffer());
  }

  createSnapshotTarGz() {
    this.ensureSyncPrereqs();
    const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'localnest-sync-'));
    const stageDir = path.join(tmpRoot, 'snapshot');
    ensureDir(stageDir);

    if (fs.existsSync(this.paths.dirs.config)) {
      fs.cpSync(this.paths.dirs.config, path.join(stageDir, 'config'), {
        recursive: true,
        filter: (source) => path.resolve(source) !== path.resolve(this.syncConfigPath)
      });
    }
    if (fs.existsSync(this.paths.dirs.data)) {
      fs.cpSync(this.paths.dirs.data, path.join(stageDir, 'data'), { recursive: true });
    }

    const tarPath = path.join(tmpRoot, 'snapshot.tar.gz');
    runOrThrow('tar', ['-czf', tarPath, '-C', stageDir, '.'], 'create snapshot archive');
    return { tmpRoot, tarPath };
  }

  restoreFromTarGz(tarPath) {
    this.ensureSyncPrereqs();
    const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'localnest-restore-'));
    const stageDir = path.join(tmpRoot, 'snapshot');
    ensureDir(stageDir);
    runOrThrow('tar', ['-xzf', tarPath, '-C', stageDir], 'extract snapshot archive');

    const configSrc = path.join(stageDir, 'config');
    const dataSrc = path.join(stageDir, 'data');

    if (fs.existsSync(configSrc)) {
      fs.rmSync(this.paths.dirs.config, { recursive: true, force: true });
      fs.cpSync(configSrc, this.paths.dirs.config, { recursive: true });
    }
    if (fs.existsSync(dataSrc)) {
      fs.rmSync(this.paths.dirs.data, { recursive: true, force: true });
      fs.cpSync(dataSrc, this.paths.dirs.data, { recursive: true });
    }
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }

  buildBundleName() {
    return `localnest-sync-${isoStamp()}.lnsync`;
  }

  async pushToGoogleDrive({ passphrase } = {}) {
    const config = this.readSyncConfig();
    if (!config || config.provider !== 'google-drive') {
      throw new Error('Sync is not initialized. Run: localnest sync init');
    }
    if (!passphrase && !config.crypto?.key) {
      throw new Error('Passphrase is required for sync push.');
    }

    const accessToken = await this.getAccessToken(config);
    const { tmpRoot, tarPath } = this.createSnapshotTarGz();
    const bundleName = this.buildBundleName();
    const encryptedPath = path.join(this.syncBackupsDir, bundleName);
    const encrypted = await encryptFile({
      inputPath: tarPath,
      outputPath: encryptedPath,
      keyB64: config.crypto.key || null,
      passphrase,
      saltB64: config.crypto.salt,
      iterations: config.crypto.iterations
    });

    const upload = await this.uploadDriveFile({
      accessToken,
      name: bundleName,
      contentType: 'application/octet-stream',
      buffer: fs.readFileSync(encryptedPath)
    });

    const manifestName = config.remote?.manifestName || 'localnest-sync-manifest.json';
    const manifest = {
      version: 1,
      provider: 'google-drive',
      updatedAt: new Date().toISOString(),
      latest: {
        fileId: upload.id,
        name: bundleName,
        sizeBytes: encrypted.sizeBytes,
        sha256: encrypted.sha256,
        crypto: {
          algorithm: 'aes-256-gcm',
          kdf: 'pbkdf2-sha256',
          iterations: config.crypto.iterations,
          salt: config.crypto.salt,
          iv: encrypted.iv,
          tag: encrypted.tag
        }
      }
    };
    await this.upsertDriveJsonFile({
      accessToken,
      name: manifestName,
      payload: manifest
    });

    this.writeSyncStatus({
      lastPushAt: new Date().toISOString(),
      provider: 'google-drive',
      remoteFileId: upload.id,
      remoteFileName: bundleName,
      remoteBytes: encrypted.sizeBytes,
      remoteSha256: encrypted.sha256,
      localBundlePath: encryptedPath
    });

    fs.rmSync(tmpRoot, { recursive: true, force: true });
    return {
      ok: true,
      bundleName,
      bundlePath: encryptedPath,
      remoteFileId: upload.id,
      sizeBytes: encrypted.sizeBytes,
      sha256: encrypted.sha256
    };
  }

  async pullFromGoogleDrive({ passphrase } = {}) {
    const config = this.readSyncConfig();
    if (!config || config.provider !== 'google-drive') {
      throw new Error('Sync is not initialized. Run: localnest sync init');
    }
    if (!passphrase && !config.crypto?.key) {
      throw new Error('Passphrase is required for sync pull.');
    }

    const accessToken = await this.getAccessToken(config);
    const manifestName = config.remote?.manifestName || 'localnest-sync-manifest.json';
    const manifestMeta = await this.findDriveFileByName(accessToken, manifestName);
    if (!manifestMeta) {
      throw new Error('No remote manifest found. Run: localnest sync push');
    }

    const manifestBuf = await this.downloadDriveFile(accessToken, manifestMeta.id);
    const manifest = JSON.parse(manifestBuf.toString('utf8'));
    const latest = manifest?.latest;
    if (!latest?.fileId) {
      throw new Error('Remote manifest has no latest backup entry.');
    }

    const encryptedBuffer = await this.downloadDriveFile(accessToken, latest.fileId);
    const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'localnest-pull-'));
    const encryptedPath = path.join(tmpRoot, latest.name || 'latest.lnsync');
    const tarPath = path.join(tmpRoot, 'restore.tar.gz');
    fs.writeFileSync(encryptedPath, encryptedBuffer);

    const actualSha = sha256File(encryptedPath);
    if (latest.sha256 && latest.sha256 !== actualSha) {
      throw new Error(`Checksum mismatch for remote backup (${latest.sha256} != ${actualSha})`);
    }

    await decryptFile({
      inputPath: encryptedPath,
      outputPath: tarPath,
      keyB64: config.crypto.key || null,
      passphrase,
      saltB64: latest.crypto?.salt || config.crypto.salt,
      iterations: latest.crypto?.iterations || config.crypto.iterations,
      ivB64: latest.crypto?.iv,
      tagB64: latest.crypto?.tag
    });

    this.restoreFromTarGz(tarPath);
    this.writeSyncStatus({
      lastPullAt: new Date().toISOString(),
      provider: 'google-drive',
      remoteFileId: latest.fileId,
      remoteFileName: latest.name,
      remoteBytes: latest.sizeBytes || encryptedBuffer.length,
      remoteSha256: latest.sha256 || actualSha
    });
    fs.rmSync(tmpRoot, { recursive: true, force: true });

    return {
      ok: true,
      fileId: latest.fileId,
      name: latest.name,
      sizeBytes: latest.sizeBytes || encryptedBuffer.length,
      sha256: latest.sha256 || actualSha
    };
  }

  async getRemoteStatus() {
    const config = this.readSyncConfig();
    if (!config || config.provider !== 'google-drive') {
      return { configured: false };
    }
    const accessToken = await this.getAccessToken(config);
    const manifestName = config.remote?.manifestName || 'localnest-sync-manifest.json';
    const manifestMeta = await this.findDriveFileByName(accessToken, manifestName);
    if (!manifestMeta) {
      return { configured: true, remote: null };
    }
    const manifestBuf = await this.downloadDriveFile(accessToken, manifestMeta.id);
    const manifest = JSON.parse(manifestBuf.toString('utf8'));
    return {
      configured: true,
      remote: manifest?.latest || null,
      manifestUpdatedAt: manifest?.updatedAt || null
    };
  }

  static createGoogleDriveConfig({
    clientId,
    clientSecret,
    refreshToken,
    keyB64 = toBase64(crypto.randomBytes(32)),
    iterations = 310000,
    saltB64 = toBase64(crypto.randomBytes(16))
  }) {
    return {
      version: 1,
      provider: 'google-drive',
      createdAt: new Date().toISOString(),
      google: {
        clientId,
        clientSecret: clientSecret || null,
        refreshToken,
        scope: GOOGLE_DRIVE_SCOPE
      },
      crypto: {
        algorithm: 'aes-256-gcm',
        kdf: 'pbkdf2-sha256',
        key: keyB64,
        iterations,
        salt: saltB64
      },
      remote: {
        manifestName: 'localnest-sync-manifest.json'
      }
    };
  }
}
