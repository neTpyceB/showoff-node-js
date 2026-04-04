import test from 'node:test';
import assert from 'node:assert/strict';
import { createAuthHandler } from '../../src/auth-service.js';
import { createPaymentHandler } from '../../src/payment-service.js';
import { createUserHandler } from '../../src/user-service.js';
import { request, startServer } from '../helpers/http.js';

test('services communicate across auth, user, and payment boundaries', async () => {
  const auth = await startServer(createAuthHandler({ secret: 'platform-secret' }));
  const payment = await startServer(createPaymentHandler({}));
  const user = await startServer(
    createUserHandler({
      authServiceUrl: auth.url,
      paymentServiceUrl: payment.url
    })
  );

  try {
    let response = await request(auth.url, '/register', {
      body: '{"email":"user@example.com","password":"secret"}',
      headers: { 'Content-Type': 'application/json' },
      method: 'POST'
    });

    assert.equal(response.status, 201);

    response = await request(auth.url, '/login', {
      body: '{"email":"user@example.com","password":"secret"}',
      headers: { 'Content-Type': 'application/json' },
      method: 'POST'
    });

    const { token } = JSON.parse(response.body);

    response = await request(user.url, '/users/me', {
      headers: { Authorization: `Bearer ${token}` }
    });

    assert.equal(response.status, 200);
    assert.equal(response.body, '{"email":"user@example.com","id":1}');

    response = await request(user.url, '/users/me/payments', {
      body: '{"amount":25}',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      method: 'POST'
    });

    assert.equal(response.status, 201);
    assert.equal(response.body, '{"amount":25,"id":1,"status":"approved","userId":1}');
  } finally {
    await auth.close();
    await payment.close();
    await user.close();
  }
});

test('services reject invalid authorization across service boundaries', async () => {
  const auth = await startServer(createAuthHandler({ secret: 'platform-secret' }));
  const payment = await startServer(createPaymentHandler({}));
  const user = await startServer(
    createUserHandler({
      authServiceUrl: auth.url,
      paymentServiceUrl: payment.url
    })
  );

  try {
    const response = await request(user.url, '/users/me', {
      headers: { Authorization: 'Bearer invalid' }
    });

    assert.equal(response.status, 401);
    assert.equal(response.body, '{"error":"Unauthorized"}');
  } finally {
    await auth.close();
    await payment.close();
    await user.close();
  }
});
