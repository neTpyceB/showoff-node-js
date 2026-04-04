import test from 'node:test';
import assert from 'node:assert/strict';
import { createUserHandler } from '../../src/user-service.js';
import { request, startServer } from '../helpers/http.js';

test('user service reads identity and creates payments', async () => {
  const calls = [];
  const responses = [
    {
      json: async () => ({ email: 'user@example.com', id: 1 }),
      status: 200
    },
    {
      json: async () => ({ email: 'user@example.com', id: 1 }),
      status: 200
    },
    {
      status: 201,
      text: async () => '{"amount":25,"id":1,"status":"approved","userId":1}'
    }
  ];
  const server = await startServer(
    createUserHandler({
      authServiceUrl: 'http://auth.test',
      fetchImpl: async (url, options = {}) => {
        calls.push({ options, url });
        return responses.shift();
      },
      paymentServiceUrl: 'http://payment.test'
    })
  );

  try {
    let response = await request(server.url, '/users/me', {
      headers: { Authorization: 'Bearer token' }
    });

    assert.equal(response.status, 200);
    assert.equal(response.body, '{"email":"user@example.com","id":1}');

    response = await request(server.url, '/users/me/payments', {
      body: '{"amount":25}',
      headers: {
        Authorization: 'Bearer token',
        'Content-Type': 'application/json'
      },
      method: 'POST'
    });

    assert.equal(response.status, 201);
    assert.equal(response.body, '{"amount":25,"id":1,"status":"approved","userId":1}');
    assert.deepEqual(calls, [
      {
        options: {
          headers: { Authorization: 'Bearer token' }
        },
        url: 'http://auth.test/verify'
      },
      {
        options: {
          headers: { Authorization: 'Bearer token' }
        },
        url: 'http://auth.test/verify'
      },
      {
        options: {
          body: '{"amount":25,"userId":1}',
          headers: { 'Content-Type': 'application/json' },
          method: 'POST'
        },
        url: 'http://payment.test/payments'
      }
    ]);
  } finally {
    await server.close();
  }
});

test('user service returns auth, route, json, and upstream errors', async () => {
  let server = await startServer(
    createUserHandler({
      authServiceUrl: 'http://auth.test',
      fetchImpl: async () => ({ status: 401 }),
      paymentServiceUrl: 'http://payment.test'
    })
  );

  try {
    let response = await request(server.url, '/users/me');

    assert.equal(response.status, 401);
    assert.equal(response.body, '{"error":"Unauthorized"}');

    response = await request(server.url, '/users/me', {
      headers: { Authorization: 'Bearer token' }
    });

    assert.equal(response.status, 401);
    assert.equal(response.body, '{"error":"Unauthorized"}');

    response = await request(server.url, '/users/me/payments', {
      body: '{"amount":25}',
      headers: {
        Authorization: 'Bearer token',
        'Content-Type': 'application/json'
      },
      method: 'POST'
    });

    assert.equal(response.status, 401);
    assert.equal(response.body, '{"error":"Unauthorized"}');

    response = await request(server.url, '/missing');

    assert.equal(response.status, 404);
    assert.equal(response.body, '{"error":"Route not found"}');
  } finally {
    await server.close();
  }

  server = await startServer(
    createUserHandler({
      authServiceUrl: 'http://auth.test',
      fetchImpl: async () => ({ json: async () => ({ email: 'user@example.com', id: 1 }), status: 200 }),
      paymentServiceUrl: 'http://payment.test'
    })
  );

  try {
    const response = await request(server.url, '/users/me/payments', {
      body: '{',
      headers: {
        Authorization: 'Bearer token',
        'Content-Type': 'application/json'
      },
      method: 'POST'
    });

    assert.equal(response.status, 400);
    assert.equal(response.body, '{"error":"Invalid JSON"}');
  } finally {
    await server.close();
  }

  server = await startServer(
    createUserHandler({
      authServiceUrl: 'http://auth.test',
      fetchImpl: async () => {
        throw new Error('upstream failed');
      },
      paymentServiceUrl: 'http://payment.test'
    })
  );

  try {
    const response = await request(server.url, '/users/me', {
      headers: { Authorization: 'Bearer token' }
    });

    assert.equal(response.status, 502);
    assert.equal(response.body, '{"error":"Service request failed"}');
  } finally {
    await server.close();
  }
});
