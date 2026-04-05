import test from 'node:test';
import assert from 'node:assert/strict';
import { createRuntimeHandler } from '../../src/runtime.js';

test('runtime creates a backend handler through the redis connector', async () => {
  const calls = [];
  const handler = await createRuntimeHandler({
    connectRedisCacheImpl: async (redisUrl) => {
      calls.push(redisUrl);
      return {
        async get() {
          return null;
        },
        async ping() {
          return 'PONG';
        },
        async set() {}
      };
    },
    createLoggerImpl: () => () => {},
    createMetricsImpl: () => ({
      recordCacheHit() {},
      recordCacheMiss() {},
      recordError() {},
      recordRequest() {},
      snapshot() {
        return {};
      }
    }),
    instanceId: 'backend-a',
    redisUrl: 'redis://cache.test:6379',
    serviceName: 'backend'
  });

  assert.equal(typeof handler, 'function');
  assert.deepEqual(calls, ['redis://cache.test:6379']);
});

test('runtime creates a balancer handler without redis', async () => {
  const handler = await createRuntimeHandler({
    backendUrls: ['http://backend-a.test', 'http://backend-b.test'],
    createLoggerImpl: () => () => {},
    createMetricsImpl: () => ({
      recordError() {},
      recordRequest() {},
      snapshot() {
        return {};
      }
    }),
    serviceName: 'balancer'
  });

  assert.equal(typeof handler, 'function');
});
