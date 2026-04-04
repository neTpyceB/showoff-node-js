import test from 'node:test';
import assert from 'node:assert/strict';
import { createGatewayHandler } from '../../src/app.js';
import { createRateLimiter } from '../../src/rate-limit.js';
import { createUpstreamHandler } from '../../src/upstream-handler.js';
import { request, startServer } from '../helpers/http.js';

test('gateway routes requests to both services and logs them', async () => {
  const logs = [];
  const serviceA = await startServer(createUpstreamHandler('service-a'));
  const serviceB = await startServer(createUpstreamHandler('service-b'));
  const server = await startServer(
    createGatewayHandler({
      authToken: 'token',
      limiter: createRateLimiter({ limit: 5, windowMs: 1000 }),
      log: (entry) => logs.push(entry),
      routes: [
        { prefix: '/service-a', service: 'service-a', targetUrl: serviceA.url },
        { prefix: '/service-b', service: 'service-b', targetUrl: serviceB.url }
      ]
    })
  );

  try {
    let response = await request(server.url, '/service-a/hello', {
      headers: { Authorization: 'Bearer token' }
    });

    assert.equal(response.status, 200);
    assert.equal(response.body, '{"body":null,"method":"GET","path":"/hello","service":"service-a"}');

    response = await request(server.url, '/service-b/tasks', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer token',
        'Content-Type': 'application/json'
      },
      body: '{"task":"sync"}'
    });

    assert.equal(response.status, 200);
    assert.equal(
      response.body,
      '{"body":"{\\"task\\":\\"sync\\"}","method":"POST","path":"/tasks","service":"service-b"}'
    );
    assert.deepEqual(logs, [
      { method: 'GET', path: '/service-a/hello', service: 'service-a', status: 200 },
      { method: 'POST', path: '/service-b/tasks', service: 'service-b', status: 200 }
    ]);
  } finally {
    await serviceA.close();
    await serviceB.close();
    await server.close();
  }
});

test('gateway returns auth, rate limit, and route errors', async () => {
  const service = await startServer(createUpstreamHandler('service-a'));
  const server = await startServer(
    createGatewayHandler({
      authToken: 'token',
      limiter: createRateLimiter({ limit: 1, windowMs: 1000 }),
      log: () => {},
      routes: [{ prefix: '/service-a', service: 'service-a', targetUrl: service.url }]
    })
  );

  try {
    let response = await request(server.url, '/missing');

    assert.equal(response.status, 404);
    assert.equal(response.body, '{"error":"Route not found"}');

    response = await request(server.url, '/service-a/hello');

    assert.equal(response.status, 401);
    assert.equal(response.body, '{"error":"Unauthorized"}');

    response = await request(server.url, '/service-a/hello', {
      headers: { Authorization: 'Bearer token' }
    });

    assert.equal(response.status, 200);

    response = await request(server.url, '/service-a/hello', {
      headers: { Authorization: 'Bearer token' }
    });

    assert.equal(response.status, 429);
    assert.equal(response.body, '{"error":"Rate limit exceeded"}');
  } finally {
    await service.close();
    await server.close();
  }
});
