import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import { encryptFile, decryptFile } from '../src/services/sync-service.js';

test('sync encrypt/decrypt round trip', async () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'localnest-sync-test-'));
  const plainPath = path.join(tmpRoot, 'plain.txt');
  const encryptedPath = path.join(tmpRoot, 'plain.enc');
  const restoredPath = path.join(tmpRoot, 'plain.restored.txt');

  fs.writeFileSync(plainPath, 'localnest-sync-roundtrip\n', 'utf8');

  const saltB64 = Buffer.from('1234567890123456').toString('base64');
  const passphrase = 'test-passphrase';
  const enc = await encryptFile({
    inputPath: plainPath,
    outputPath: encryptedPath,
    passphrase,
    saltB64,
    iterations: 1000
  });

  await decryptFile({
    inputPath: encryptedPath,
    outputPath: restoredPath,
    passphrase,
    saltB64,
    iterations: 1000,
    ivB64: enc.iv,
    tagB64: enc.tag
  });

  const original = fs.readFileSync(plainPath, 'utf8');
  const restored = fs.readFileSync(restoredPath, 'utf8');
  assert.equal(restored, original);

  fs.rmSync(tmpRoot, { recursive: true, force: true });
});
