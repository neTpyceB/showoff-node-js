import test from 'node:test';
import assert from 'node:assert/strict';
import { startProcess, stopProcess, waitForServer } from '../helpers/process.js';

test('process runtime supports balancing, metrics, and health', async () => {
  const balancerPort = 6100 + Math.floor(Math.random() * 500);
  const backendAPort = balancerPort + 1;
  const backendBPort = balancerPort + 2;
  const backendA = startProcess('test/helpers/run-backend.js', {
    INSTANCE_ID: 'backend-a',
    PORT: String(backendAPort)
  });
  const backendB = startProcess('test/helpers/run-backend.js', {
    INSTANCE_ID: 'backend-b',
    PORT: String(backendBPort)
  });
  const balancer = startProcess('src/server.js', {
    BACKEND_URLS: `http://127.0.0.1:${backendAPort},http://127.0.0.1:${backendBPort}`,
    PORT: String(balancerPort),
    SERVICE_NAME: 'balancer'
  });

  try {
    await waitForServer(`http://127.0.0.1:${backendAPort}`);
    await waitForServer(`http://127.0.0.1:${backendBPort}`);
    await waitForServer(`http://127.0.0.1:${balancerPort}`);

    let response = await fetch(`http://127.0.0.1:${balancerPort}/records/42`, {
      headers: { Connection: 'close' }
    });

    assert.equal(response.status, 200);

    response = await fetch(`http://127.0.0.1:${balancerPort}/health`, {
      headers: { Connection: 'close' }
    });

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      backends: [
        { instanceId: 'backend-a', redis: 'ok', status: 'ok' },
        { instanceId: 'backend-b', redis: 'ok', status: 'ok' }
      ],
      status: 'ok'
    });

    response = await fetch(`http://127.0.0.1:${balancerPort}/metrics`, {
      headers: { Connection: 'close' }
    });

    assert.equal(response.status, 200);
    assert.equal((await response.json()).backends.length, 2);
  } finally {
    await stopProcess(balancer);
    await stopProcess(backendA);
    await stopProcess(backendB);
  }
});
