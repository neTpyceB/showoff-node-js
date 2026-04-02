import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { request } from '../helpers/http.js';

async function waitForServer(baseUrl) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await request(baseUrl, '/transform/csv-to-ndjson', {
        method: 'POST',
        headers: { 'Content-Type': 'text/csv' },
        body: 'name\nalice\n'
      });

      if (response.status === 200) {
        return response;
      }
    } catch {}

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error('Server did not start');
}

async function stopServer(server) {
  if (server.exitCode !== null || server.signalCode !== null) {
    return;
  }

  await new Promise((resolve) => {
    server.once('close', resolve);
    server.kill('SIGTERM');
  });
}

test('server starts and processes a minimal csv stream', async () => {
  const port = 4100 + Math.floor(Math.random() * 1000);
  const baseUrl = `http://127.0.0.1:${port}`;
  const server = spawn(process.execPath, ['src/server.js'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT: String(port)
    },
    stdio: 'ignore'
  });

  try {
    const response = await waitForServer(baseUrl);

    assert.equal(response.status, 200);
    assert.equal(response.body, '{"name":"alice"}\n');
  } finally {
    await stopServer(server);
  }
});
