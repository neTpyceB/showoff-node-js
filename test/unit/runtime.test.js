import test from 'node:test';
import assert from 'node:assert/strict';
import { createRuntime } from '../../src/runtime.js';

test('runtime creates the api handler', async () => {
  let closed = false;
  const runtime = await createRuntime({
    connectRedisStoreImpl: async () => ({
      async addEvent() {},
      async close() {
        closed = true;
      },
      async ping() {
        return 'PONG';
      },
      async readList() {
        return [];
      }
    }),
    redisUrl: 'redis://cache.test:6379',
    serviceName: 'api'
  });

  assert.equal(typeof runtime.handler, 'function');
  await runtime.stop();
  assert.equal(closed, true);
});

test('runtime creates a worker handler and tick path', async () => {
  let closed = false;
  let ensured = false;
  const runtime = await createRuntime({
    connectRedisStoreImpl: async () => ({
      async ack() {},
      async appendList() {},
      async claimPending() {
        return [];
      },
      async close() {
        closed = true;
      },
      async ensureGroup() {
        ensured = true;
      },
      async ping() {
        return 'PONG';
      },
      async readNew() {
        return [];
      }
    }),
    consumerName: 'worker-1',
    redisUrl: 'redis://cache.test:6379',
    retryAfterMs: 0,
    serviceName: 'audit'
  });

  assert.equal(typeof runtime.handler, 'function');
  await runtime.tick();
  assert.equal(ensured, true);
  await runtime.stop();
  assert.equal(closed, true);
});
