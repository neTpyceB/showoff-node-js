import test from 'node:test';
import assert from 'node:assert/strict';
import { createAuthHandler } from '../../src/auth-service.js';
import { startServer, request } from '../helpers/http.js';

test('auth service registers, logs in, and verifies users', async () => {
  const server = await startServer(createAuthHandler({ secret: 'service-secret' }));

  try {
    let response = await request(server.url, '/register', {
      body: '{"email":"user@example.com","password":"secret"}',
      headers: { 'Content-Type': 'application/json' },
      method: 'POST'
    });

    assert.equal(response.status, 201);
    assert.equal(response.body, '{"email":"user@example.com","id":1}');

    response = await request(server.url, '/login', {
      body: '{"email":"user@example.com","password":"secret"}',
      headers: { 'Content-Type': 'application/json' },
      method: 'POST'
    });

    assert.equal(response.status, 200);

    const { token } = JSON.parse(response.body);

    response = await request(server.url, '/verify', {
      headers: { Authorization: `Bearer ${token}` }
    });

    assert.equal(response.status, 200);
    assert.equal(response.body, '{"email":"user@example.com","id":1}');
  } finally {
    await server.close();
  }
});

test('auth service returns route, auth, and json errors', async () => {
  const server = await startServer(createAuthHandler({ secret: 'service-secret' }));

  try {
    let response = await request(server.url, '/register', {
      body: '{"email":"user@example.com","password":"secret"}',
      headers: { 'Content-Type': 'application/json' },
      method: 'POST'
    });

    assert.equal(response.status, 201);

    response = await request(server.url, '/login', {
      body: '{"email":"user@example.com","password":"wrong"}',
      headers: { 'Content-Type': 'application/json' },
      method: 'POST'
    });

    assert.equal(response.status, 401);
    assert.equal(response.body, '{"error":"Unauthorized"}');

    response = await request(server.url, '/register', {
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
