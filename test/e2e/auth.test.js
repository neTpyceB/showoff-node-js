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
      await fetch(url, {
        headers: {
          Connection: 'close'
        }
      });
      return;
    } catch {}

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error('Server did not start');
}

async function request(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      Connection: 'close',
      ...(options.headers ?? {})
    }
  });
  const text = await response.text();

  return {
    body: text ? JSON.parse(text) : null,
    status: response.status
  };
}

test('server supports the auth flow over real HTTP', async () => {
  const port = 3100 + Math.floor(Math.random() * 1000);
  const baseUrl = `http://127.0.0.1:${port}`;
  const userEmail = `user-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
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
    await waitForServer(`${baseUrl}/auth/me`);

    let response = await request(baseUrl, '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, password: 'password123' })
    });

    assert.equal(response.status, 201);
    assert.deepEqual(response.body, {
      id: 2,
      email: userEmail,
      role: 'user'
    });

    response = await request(baseUrl, '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, password: 'password123' })
    });

    assert.equal(response.status, 200);
    const userToken = response.body.token;

    response = await request(baseUrl, '/auth/me', {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.role, 'user');

    response = await request(baseUrl, '/auth/admin', {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    assert.equal(response.status, 403);

    response = await request(baseUrl, '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'admin-password' })
    });

    response = await request(baseUrl, '/auth/admin', {
      headers: { Authorization: `Bearer ${response.body.token}` }
    });

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, { access: 'granted' });
  } finally {
    await stopServer(server);
  }
});
