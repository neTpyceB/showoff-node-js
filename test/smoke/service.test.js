import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

function startProcess(file, env) {
  return spawn(process.execPath, [file], {
    cwd: process.cwd(),
    env: { ...process.env, ...env },
    stdio: 'ignore'
  });
}

async function waitForServer(baseUrl) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/missing`);

      if (response.status === 404) {
        return;
      }
    } catch {}

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error('Server did not start');
}

async function waitForService(baseUrl) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/hello`);

      if (response.status === 200) {
        return;
      }
    } catch {}

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error('Service did not start');
}

async function stopServer(server, signal = 'SIGTERM') {
  if (server.exitCode !== null || server.signalCode !== null) {
    return;
  }

  await new Promise((resolve) => {
    server.once('close', resolve);
    server.kill(signal);
  });
}

test('gateway starts and applies rate limiting', async () => {
  const gatewayPort = 4100 + Math.floor(Math.random() * 1000);
  const serviceAPort = gatewayPort + 1;
  const serviceBPort = gatewayPort + 2;
  const baseUrl = `http://127.0.0.1:${gatewayPort}`;
  const serviceA = startProcess('src/upstream-server.js', {
    PORT: String(serviceAPort),
    SERVICE_NAME: 'service-a'
  });
  const serviceB = startProcess('src/upstream-server.js', {
    PORT: String(serviceBPort),
    SERVICE_NAME: 'service-b'
  });
  const gateway = startProcess('src/server.js', {
    AUTH_TOKEN: 'token',
    PORT: String(gatewayPort),
    RATE_LIMIT_LIMIT: '2',
    RATE_LIMIT_WINDOW_MS: '1000',
    SERVICE_A_URL: `http://127.0.0.1:${serviceAPort}`,
    SERVICE_B_URL: `http://127.0.0.1:${serviceBPort}`
  });

  try {
    await waitForService(`http://127.0.0.1:${serviceAPort}`);
    await waitForService(`http://127.0.0.1:${serviceBPort}`);
    await waitForServer(baseUrl);

    const headers = { Authorization: 'Bearer token' };
    let response = await fetch(`${baseUrl}/service-a/hello`, { headers });

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      body: null,
      method: 'GET',
      path: '/hello',
      service: 'service-a'
    });

    response = await fetch(`${baseUrl}/service-b/hello`, { headers });

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      body: null,
      method: 'GET',
      path: '/hello',
      service: 'service-b'
    });

    response = await fetch(`${baseUrl}/service-a/hello`, { headers });

    assert.equal(response.status, 429);
    assert.deepEqual(await response.json(), { error: 'Rate limit exceeded' });
  } finally {
    await stopServer(gateway);
    await stopServer(serviceA);
    await stopServer(serviceB);
  }
});
