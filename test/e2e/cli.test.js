import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { spawn } from 'node:child_process';

async function createWorkspace() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'file-manager-e2e-'));

  await fs.mkdir(path.join(root, 'nested'), { recursive: true });
  await fs.writeFile(path.join(root, 'seed.txt'), 'seed');
  await fs.writeFile(path.join(root, 'nested', 'data.txt'), 'data');

  return root;
}

test('CLI completes the core flow from stdin', async () => {
  const root = await createWorkspace();
  const child = spawn(process.execPath, ['src/cli.js'], {
    cwd: process.cwd(),
    env: process.env
  });
  let stdout = '';
  let stderr = '';

  child.stdout.on('data', (chunk) => {
    stdout += chunk;
  });

  child.stderr.on('data', (chunk) => {
    stderr += chunk;
  });

  child.stdin.write(`cd "${root}"\n`);
  child.stdin.write('pwd\n');
  child.stdin.write('write "notes file.txt" "hello world"\n');
  child.stdin.write('read "notes file.txt"\n');
  child.stdin.write('find .txt\n');
  child.stdin.write('stream "notes file.txt" copy.txt\n');
  child.stdin.write('unknown\n');
  child.stdin.end();

  const exitCode = await new Promise((resolve) => {
    child.on('close', resolve);
  });

  assert.equal(exitCode, 0);
  assert.match(stdout, new RegExp(`${root.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
  assert.match(stdout, /hello world/);
  assert.match(stdout, /notes file\.txt/);
  assert.match(stdout, /11/);
  assert.match(stderr, /Unknown command: unknown/);
  assert.equal(await fs.readFile(path.join(root, 'copy.txt'), 'utf8'), 'hello world');
});
