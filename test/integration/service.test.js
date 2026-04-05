import test from 'node:test';
import assert from 'node:assert/strict';
import { createBackendHandler } from '../../src/backend-app.js';
import { createBalancerHandler } from '../../src/balancer-app.js';
import { createMetrics } from '../../src/metrics.js';
import { request, startServer } from '../helpers/http.js';

function createSharedCache(store) {
  return {
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
}

test('balancer and backends share cached records across instances', async () => {
  const store = new Map();
  const backendA = await startServer(
    createBackendHandler({
      cache: createSharedCache(store),
      instanceId: 'backend-a',
      log: () => {},
      metrics: createMetrics()
    })
  );
  const backendB = await startServer(
    createBackendHandler({
      cache: createSharedCache(store),
      instanceId: 'backend-b',
      log: () => {},
      metrics: createMetrics()
    })
  );
  const balancer = await startServer(
    createBalancerHandler({
      backendUrls: [backendA.url, backendB.url],
      log: () => {},
      metrics: createMetrics()
    })
  );

  try {
    let response = await request(balancer.url, '/records/42');

    assert.equal(response.status, 200);
    assert.equal(response.body, '{"cached":false,"id":"42","instanceId":"backend-a","value":"value-42"}');

    response = await request(balancer.url, '/records/42');

    assert.equal(response.status, 200);
    assert.equal(response.body, '{"cached":true,"id":"42","instanceId":"backend-b","value":"value-42"}');

    response = await request(balancer.url, '/metrics');
    const metrics = JSON.parse(response.body);

    assert.equal(metrics.loadBalancer.requestsTotal, 2);
    assert.equal(metrics.backends.length, 2);

    response = await request(balancer.url, '/health');

    assert.equal(response.status, 200);
    assert.equal(response.body, '{"backends":[{"instanceId":"backend-a","redis":"ok","status":"ok"},{"instanceId":"backend-b","redis":"ok","status":"ok"}],"status":"ok"}');
  } finally {
    await backendA.close();
    await backendB.close();
    await balancer.close();
  }
});
