import test from 'node:test';
import assert from 'node:assert/strict';
import { startProcess, stopProcess, waitForServer } from '../helpers/process.js';

test('services communicate over real http processes', async () => {
  const authPort = 5100 + Math.floor(Math.random() * 500);
  const userPort = authPort + 1;
  const paymentPort = authPort + 2;
  const auth = startProcess('src/server.js', {
    AUTH_SECRET: 'platform-secret',
    PORT: String(authPort),
    SERVICE_NAME: 'auth'
  });
  const payment = startProcess('src/server.js', {
    PORT: String(paymentPort),
    SERVICE_NAME: 'payment'
  });
  const user = startProcess('src/server.js', {
    AUTH_SERVICE_URL: `http://127.0.0.1:${authPort}`,
    PAYMENT_SERVICE_URL: `http://127.0.0.1:${paymentPort}`,
    PORT: String(userPort),
    SERVICE_NAME: 'user'
  });

  try {
    await waitForServer(`http://127.0.0.1:${authPort}`);
    await waitForServer(`http://127.0.0.1:${paymentPort}`);
    await waitForServer(`http://127.0.0.1:${userPort}`);

    let response = await fetch(`http://127.0.0.1:${authPort}/register`, {
      body: '{"email":"user@example.com","password":"secret"}',
      headers: {
        Connection: 'close',
        'Content-Type': 'application/json'
      },
      method: 'POST'
    });

    assert.equal(response.status, 201);

    response = await fetch(`http://127.0.0.1:${authPort}/login`, {
      body: '{"email":"user@example.com","password":"secret"}',
      headers: {
        Connection: 'close',
        'Content-Type': 'application/json'
      },
      method: 'POST'
    });

    const { token } = await response.json();

    response = await fetch(`http://127.0.0.1:${userPort}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Connection: 'close'
      }
    });

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { email: 'user@example.com', id: 1 });

    response = await fetch(`http://127.0.0.1:${userPort}/users/me/payments`, {
      body: '{"amount":25}',
      headers: {
        Authorization: `Bearer ${token}`,
        Connection: 'close',
        'Content-Type': 'application/json'
      },
      method: 'POST'
    });

    assert.equal(response.status, 201);
    assert.deepEqual(await response.json(), {
      amount: 25,
      id: 1,
      status: 'approved',
      userId: 1
    });
  } finally {
    await stopProcess(user);
    await stopProcess(payment);
    await stopProcess(auth, 'SIGINT');
  }
});
