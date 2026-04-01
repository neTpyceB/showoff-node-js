import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

async function waitForServer(url) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(url);

      if (response.ok) {
        return;
      }
    } catch {}

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error('Server did not start');
}

test('server handles CRUD over real HTTP', async () => {
  const port = 3100;
  const server = spawn(process.execPath, ['src/server.js'], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(port) }
  });

  try {
    await waitForServer(`http://127.0.0.1:${port}/items`);

    let response = await fetch(`http://127.0.0.1:${port}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'first' })
    });

    assert.equal(response.status, 201);
    assert.deepEqual(await response.json(), { id: 1, name: 'first' });

    response = await fetch(`http://127.0.0.1:${port}/items/1`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { id: 1, name: 'first' });

    response = await fetch(`http://127.0.0.1:${port}/items/1`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'updated' })
    });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { id: 1, name: 'updated' });

    response = await fetch(`http://127.0.0.1:${port}/items`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), [{ id: 1, name: 'updated' }]);

    response = await fetch(`http://127.0.0.1:${port}/items/1`, { method: 'DELETE' });
    assert.equal(response.status, 204);

    response = await fetch(`http://127.0.0.1:${port}/items`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), []);
  } finally {
    server.kill('SIGTERM');
    await new Promise((resolve) => {
      server.on('close', resolve);
    });
  }
});
