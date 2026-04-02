import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

async function stopServer(server) {
  if (server.exitCode !== null || server.signalCode !== null) {
    return;
  }

  await new Promise((resolve) => {
    server.once('close', resolve);
    server.kill('SIGTERM');
  });
}

async function waitForServer(url) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          Connection: 'close'
        }
      });

      if (response.status === 401) {
        return response;
      }
    } catch {}

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error('Server did not start');
}

test('server starts and responds on the auth surface', async () => {
  const port = 4100 + Math.floor(Math.random() * 1000);
  const server = spawn(process.execPath, ['src/server.js'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT: String(port),
      JWT_SECRET: 'secret',
      ADMIN_EMAIL: 'admin@example.com',
      ADMIN_PASSWORD: 'admin-password'
    },
    stdio: 'ignore'
  });

  try {
    const response = await waitForServer(`http://127.0.0.1:${port}/auth/me`);

    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { error: 'Authentication required' });
  } finally {
    await stopServer(server);
  }
});
