import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

async function waitForServer(url) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(url);

      if (response.ok) {
        return response;
      }
    } catch {}

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error('Server did not start');
}

test('server starts and answers a minimal request', async () => {
  const port = 3101;
  const server = spawn(process.execPath, ['src/server.js'], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(port) }
  });

  try {
    const response = await waitForServer(`http://127.0.0.1:${port}/items`);

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), []);
  } finally {
    server.kill('SIGTERM');
    await new Promise((resolve) => {
      server.on('close', resolve);
    });
  }
});
