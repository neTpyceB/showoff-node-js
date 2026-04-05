import test from 'node:test';
import assert from 'node:assert/strict';
import { connectRedisCache, wrapRedisClient } from '../../src/cache.js';

test('cache wrapper delegates to the redis client', async () => {
  const calls = [];
  const cache = wrapRedisClient({
    async get(key) {
      calls.push(['get', key]);
      return 'value';
    },
    async ping() {
      calls.push(['ping']);
      return 'PONG';
    },
    async set(key, value, options) {
      calls.push(['set', key, value, options]);
    }
  });

  assert.equal(await cache.get('record:1'), 'value');
  assert.equal(await cache.ping(), 'PONG');
  await cache.set('record:1', '{"value":"value-1"}', 60);
  assert.deepEqual(calls, [
    ['get', 'record:1'],
    ['ping'],
    ['set', 'record:1', '{"value":"value-1"}', { EX: 60 }]
  ]);
});

test('connectRedisCache creates and connects a redis client', async () => {
  const calls = [];
  const cache = await connectRedisCache('redis://cache.test:6379', (options) => {
    calls.push(['createClient', options]);
    return {
      async connect() {
        calls.push(['connect']);
      },
      async get(key) {
        return key;
      },
      async ping() {
        return 'PONG';
      },
      async set() {}
    };
  });

  assert.equal(await cache.get('record:1'), 'record:1');
  assert.deepEqual(calls, [
    ['createClient', { url: 'redis://cache.test:6379' }],
    ['connect']
  ]);
});
