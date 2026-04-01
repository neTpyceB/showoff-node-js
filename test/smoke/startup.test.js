import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { PassThrough } from 'node:stream';
import { promises as fs } from 'node:fs';
import { run } from '../../src/cli.js';

test('run processes a minimal command stream', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'file-manager-smoke-'));
  const input = new PassThrough();
  const output = new PassThrough();
  const error = new PassThrough();
  let stdout = '';
  let stderr = '';

  output.on('data', (chunk) => {
    stdout += chunk;
  });

  error.on('data', (chunk) => {
    stderr += chunk;
  });

  const execution = run({ input, output, error, startDir: root });

  input.end('\npwd\n');
  await execution;

  assert.equal(stderr, '');
  assert.equal(stdout.trim(), root);
});
