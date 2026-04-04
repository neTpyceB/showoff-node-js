import test from 'node:test';
import assert from 'node:assert/strict';
import { createGatewayHandler } from '../../src/app.js';
import { request, startServer } from '../helpers/http.js';

test('gateway proxies authorized requests and logs routed responses', async () => {
  const logs = [];
  const server = await startServer(
    createGatewayHandler({
      authToken: 'token',
      fetchImpl: async (url, options) => {
        assert.equal(url, 'http://service-a/hello');
        assert.equal(options.method, 'GET');

        return new Response(JSON.stringify({ service: 'service-a' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 200
        });
      },
      limiter: { check: () => ({ allowed: true }) },
      log: (entry) => logs.push(entry),
      routes: [{ prefix: '/service-a', service: 'service-a', targetUrl: 'http://service-a' }]
    })
  );

  try {
    const response = await request(server.url, '/service-a/hello', {
      headers: { Authorization: 'Bearer token' }
    });

    assert.equal(response.status, 200);
    assert.equal(response.body, '{"service":"service-a"}');
    assert.deepEqual(logs, [
      { method: 'GET', path: '/service-a/hello', service: 'service-a', status: 200 }
    ]);
  } finally {
    await server.close();
  }
});

test('gateway returns route, auth, rate-limit, json, and upstream errors', async () => {
  const logs = [];
  const allowed = [false, true, true];
  const server = await startServer(
    createGatewayHandler({
      authToken: 'token',
      fetchImpl: async (url, options) => {
        if (url === 'http://service-b/fail') {
          throw new Error('upstream failed');
        }

        return new Response(options.body, {
          headers: { 'Content-Type': 'application/json' },
          status: 200
        });
      },
      limiter: {
        check: () => ({ allowed: allowed.shift() ?? true })
      },
      log: (entry) => logs.push(entry),
      routes: [{ prefix: '/service-b', service: 'service-b', targetUrl: 'http://service-b' }]
    })
  );

  try {
    let response = await request(server.url, '/missing');

    assert.equal(response.status, 404);
    assert.equal(response.body, '{"error":"Route not found"}');

    response = await request(server.url, '/service-b/hello');

    assert.equal(response.status, 401);
    assert.equal(response.body, '{"error":"Unauthorized"}');

    response = await request(server.url, '/service-b/hello', {
      headers: { Authorization: 'Bearer token' }
    });

    assert.equal(response.status, 429);
    assert.equal(response.body, '{"error":"Rate limit exceeded"}');

    response = await request(server.url, '/service-b/tasks', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer token',
        'Content-Type': 'application/json'
      },
      body: '{'
    });

    assert.equal(response.status, 400);
    assert.equal(response.body, '{"error":"Invalid JSON"}');

    response = await request(server.url, '/service-b/fail', {
      headers: { Authorization: 'Bearer token' }
    });

    assert.equal(response.status, 502);
    assert.equal(response.body, '{"error":"Upstream request failed"}');
    assert.deepEqual(logs, [
      { method: 'GET', path: '/missing', service: null, status: 404 },
      { method: 'GET', path: '/service-b/hello', service: 'service-b', status: 401 },
      { method: 'GET', path: '/service-b/hello', service: 'service-b', status: 429 },
      { method: 'POST', path: '/service-b/tasks', service: 'service-b', status: 400 },
      { method: 'GET', path: '/service-b/fail', service: 'service-b', status: 502 }
    ]);
  } finally {
    await server.close();
  }
});
