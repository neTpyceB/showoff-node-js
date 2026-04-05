import test from 'node:test';
import assert from 'node:assert/strict';
import { createBalancerHandler } from '../../src/balancer-app.js';
import { createMetrics } from '../../src/metrics.js';
import { request, startServer } from '../helpers/http.js';

test('balancer proxies requests and exposes metrics and health', async () => {
  const logs = [];
  const responses = new Map([
    [
      'http://backend-a.test/records/42',
      { status: 200, text: async () => '{"cached":false,"id":"42","instanceId":"backend-a","value":"value-42"}' }
    ],
    [
      'http://backend-b.test/records/42',
      { status: 200, text: async () => '{"cached":true,"id":"42","instanceId":"backend-b","value":"value-42"}' }
    ],
    [
      'http://backend-a.test/metrics',
      { json: async () => ({ cacheHitsTotal: 0, cacheMissesTotal: 1, errorsTotal: 0, instanceId: 'backend-a', requestsTotal: 1 }) }
    ],
    [
      'http://backend-b.test/metrics',
      { json: async () => ({ cacheHitsTotal: 1, cacheMissesTotal: 0, errorsTotal: 0, instanceId: 'backend-b', requestsTotal: 1 }) }
    ],
    [
      'http://backend-a.test/health',
      { json: async () => ({ instanceId: 'backend-a', redis: 'ok', status: 'ok' }) }
    ],
    [
      'http://backend-b.test/health',
      { json: async () => ({ instanceId: 'backend-b', redis: 'ok', status: 'ok' }) }
    ]
  ]);
  const server = await startServer(
    createBalancerHandler({
      backendUrls: ['http://backend-a.test', 'http://backend-b.test'],
      fetchImpl: async (url) => responses.get(url),
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
    assert.equal(response.body, '{"cached":true,"id":"42","instanceId":"backend-b","value":"value-42"}');

    response = await request(server.url, '/metrics');

    assert.equal(response.status, 200);
    assert.equal(
      response.body,
      '{"backends":[{"cacheHitsTotal":0,"cacheMissesTotal":1,"errorsTotal":0,"instanceId":"backend-a","requestsTotal":1},{"cacheHitsTotal":1,"cacheMissesTotal":0,"errorsTotal":0,"instanceId":"backend-b","requestsTotal":1}],"loadBalancer":{"cacheHitsTotal":0,"cacheMissesTotal":0,"errorsTotal":0,"requestsTotal":2}}'
    );

    response = await request(server.url, '/health');

    assert.equal(response.status, 200);
    assert.equal(
      response.body,
      '{"backends":[{"instanceId":"backend-a","redis":"ok","status":"ok"},{"instanceId":"backend-b","redis":"ok","status":"ok"}],"status":"ok"}'
    );
    assert.deepEqual(logs, [
      {
        backendUrl: 'http://backend-a.test',
        method: 'GET',
        path: '/records/42',
        status: 200
      },
      {
        backendUrl: 'http://backend-b.test',
        method: 'GET',
        path: '/records/42',
        status: 200
      }
    ]);
  } finally {
    await server.close();
  }
});

test('balancer returns route and upstream errors', async () => {
  let server = await startServer(
    createBalancerHandler({
      backendUrls: ['http://backend-a.test'],
      fetchImpl: async () => {
        throw new Error('backend unavailable');
      },
      log: () => {},
      metrics: createMetrics()
    })
  );

  try {
    let response = await request(server.url, '/missing');

    assert.equal(response.status, 404);
    assert.equal(response.body, '{"error":"Route not found"}');

    response = await request(server.url, '/records/42');

    assert.equal(response.status, 503);
    assert.equal(response.body, '{"error":"Backend unavailable"}');
  } finally {
    await server.close();
  }

  server = await startServer(
    createBalancerHandler({
      backendUrls: ['http://backend-a.test'],
      fetchImpl: async () => {
        throw new Error('backend unavailable');
      },
      log: () => {},
      metrics: createMetrics()
    })
  );

  try {
    const response = await request(server.url, '/health');

    assert.equal(response.status, 503);
    assert.equal(response.body, '{"status":"error"}');
  } finally {
    await server.close();
  }
});
