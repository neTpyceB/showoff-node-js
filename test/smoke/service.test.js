import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

async function waitForServer(baseUrl) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/jobs/missing`);

      if (response.status === 404) {
        return;
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

test('server starts and returns a completed job', async () => {
  const port = 4100 + Math.floor(Math.random() * 1000);
  const baseUrl = `http://127.0.0.1:${port}`;
  const server = spawn(process.execPath, ['test/helpers/fake-process-server.js'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT: String(port)
    },
    stdio: 'ignore'
  });

  try {
    await waitForServer(baseUrl);

    const enqueue = await fetch(`${baseUrl}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: 'hi', delayMs: 0, failUntilAttempt: 0 })
    });
    const { id } = await enqueue.json();
    const response = await fetch(`${baseUrl}/jobs/${id}`);

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      id,
      state: 'completed',
      attemptsMade: 0,
      result: { output: 'HI' },
      failedReason: null
    });
  } finally {
    await stopServer(server);
  }
});
