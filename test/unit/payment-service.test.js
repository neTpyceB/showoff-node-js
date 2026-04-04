import test from 'node:test';
import assert from 'node:assert/strict';
import { createPaymentHandler } from '../../src/payment-service.js';
import { request, startServer } from '../helpers/http.js';

test('payment service creates payments', async () => {
  const server = await startServer(createPaymentHandler({}));

  try {
    const response = await request(server.url, '/payments', {
      body: '{"amount":25,"userId":1}',
      headers: { 'Content-Type': 'application/json' },
      method: 'POST'
    });

    assert.equal(response.status, 201);
    assert.equal(response.body, '{"amount":25,"id":1,"status":"approved","userId":1}');
  } finally {
    await server.close();
  }
});

test('payment service returns route and json errors', async () => {
  const server = await startServer(createPaymentHandler({}));

  try {
    let response = await request(server.url, '/payments', {
      body: '{',
      headers: { 'Content-Type': 'application/json' },
      method: 'POST'
    });

    assert.equal(response.status, 400);
    assert.equal(response.body, '{"error":"Invalid JSON"}');

    response = await request(server.url, '/missing');

    assert.equal(response.status, 404);
    assert.equal(response.body, '{"error":"Route not found"}');
  } finally {
    await server.close();
  }
});
