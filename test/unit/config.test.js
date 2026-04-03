import test from 'node:test';
import assert from 'node:assert/strict';
import { readPort, readQueueName, readRedisUrl } from '../../src/config.js';

test('config reads explicit values and defaults', () => {
  assert.equal(readPort({ PORT: '4321' }), 4321);
  assert.equal(readPort({}), 3000);
  assert.equal(readQueueName({ QUEUE_NAME: 'queue' }), 'queue');
  assert.equal(readQueueName({}), 'jobs');
  assert.equal(readRedisUrl({ REDIS_URL: 'redis://example:6379' }), 'redis://example:6379');
  assert.equal(readRedisUrl({}), 'redis://127.0.0.1:6379');
});
