import test from 'node:test';
import assert from 'node:assert/strict';
import { createBackendHandler } from '../../src/backend-app.js';
import { createMetrics } from '../../src/metrics.js';
import { request, startServer } from '../helpers/http.js';

test('backend serves cache misses, hits, metrics, and health', async () => {
  const store = new Map();
  const logs = [];
  const cache = {
    async get(key) {
      return store.get(key) ?? null;
    },
    async ping() {
      return 'PONG';
    },
    async set(key, value) {
      store.set(key, value);
    }
  };
  const server = await startServer(
    createBackendHandler({
      cache,
      instanceId: 'backend-a',
      log: (entry) => logs.push(entry),
      metrics: createMetrics()
    })
  );

  try {
    let response = await request(server.url, '/records/42');

    assert.equal(response.status, 200);
    assert.equal(response.body, '{"cached":false,"id":"42","instanceId":"backend-a","value":"value-42"}');

    response = await request(server.url, '/records/42');

    assert.equal(response.status, 200);
    assert.equal(response.body, '{"cached":true,"id":"42","instanceId":"backend-a","value":"value-42"}');

    response = await request(server.url, '/metrics');

    assert.equal(response.status, 200);
    assert.equal(
      response.body,
      '{"instanceId":"backend-a","cacheHitsTotal":1,"cacheMissesTotal":1,"errorsTotal":0,"requestsTotal":2}'
    );

    response = await request(server.url, '/health');

    assert.equal(response.status, 200);
    assert.equal(response.body, '{"instanceId":"backend-a","redis":"ok","status":"ok"}');
    assert.deepEqual(logs, [
      { cache: 'miss', instanceId: 'backend-a', method: 'GET', path: '/records/42', status: 200 },
      { cache: 'hit', instanceId: 'backend-a', method: 'GET', path: '/records/42', status: 200 }
    ]);
  } finally {
    await server.close();
  }
});

test('backend returns route and cache errors', async () => {
  let server = await startServer(
    createBackendHandler({
      cache: {
        async get() {
          throw new Error('redis unavailable');
        },
        async ping() {
          return 'PONG';
        },
        async set() {}
      },
      instanceId: 'backend-a',
      log: () => {},
      metrics: createMetrics()
    })
  );

  try {
    let response = await request(server.url, '/missing');

    assert.equal(response.status, 404);
    assert.equal(response.body, '{"error":"Route not found"}');

    response = await request(server.url, '/records/42', {
      method: 'POST'
    });

    assert.equal(response.status, 404);
    assert.equal(response.body, '{"error":"Route not found"}');

    response = await request(server.url, '/records/42');

    assert.equal(response.status, 503);
    assert.equal(response.body, '{"error":"Cache unavailable"}');
  } finally {
    await server.close();
  }

  server = await startServer(
    createBackendHandler({
      cache: {
        async get() {
          return null;
        },
        async ping() {
          throw new Error('redis unavailable');
        },
        async set() {}
      },
      instanceId: 'backend-a',
      log: () => {},
      metrics: createMetrics()
    })
  );

  try {
    const response = await request(server.url, '/health');

    assert.equal(response.status, 503);
    assert.equal(response.body, '{"instanceId":"backend-a","redis":"error","status":"error"}');
  } finally {
    await server.close();
  }
});
