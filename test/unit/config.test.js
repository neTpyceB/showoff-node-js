import test from 'node:test';
import assert from 'node:assert/strict';
import { readConsumerName, readPort, readRedisUrl, readRetryAfterMs, readServiceName } from '../../src/config.js';

test('config reads explicit values and defaults', () => {
  const previous = {
    CONSUMER_NAME: process.env.CONSUMER_NAME,
    PORT: process.env.PORT,
    REDIS_URL: process.env.REDIS_URL,
    RETRY_AFTER_MS: process.env.RETRY_AFTER_MS,
    SERVICE_NAME: process.env.SERVICE_NAME
  };

  delete process.env.CONSUMER_NAME;
  delete process.env.PORT;
  delete process.env.REDIS_URL;
  delete process.env.RETRY_AFTER_MS;
  delete process.env.SERVICE_NAME;

  assert.equal(readPort(), 3000);
  assert.equal(readRedisUrl(), 'redis://127.0.0.1:6379');
  assert.equal(readRetryAfterMs(), 100);
  assert.equal(readServiceName(), 'api');
  assert.match(readConsumerName(), /^api-\d+$/);

  process.env.CONSUMER_NAME = 'worker-1';
  process.env.PORT = '3010';
  process.env.REDIS_URL = 'redis://cache.internal:6379';
  process.env.RETRY_AFTER_MS = '250';
  process.env.SERVICE_NAME = 'notifications';

  assert.equal(readConsumerName(), 'worker-1');
  assert.equal(readPort(), 3010);
  assert.equal(readRedisUrl(), 'redis://cache.internal:6379');
  assert.equal(readRetryAfterMs(), 250);
  assert.equal(readServiceName(), 'notifications');

  for (const [key, value] of Object.entries(previous)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
});
