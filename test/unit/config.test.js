import test from 'node:test';
import assert from 'node:assert/strict';
import {
  readBackendUrls,
  readInstanceId,
  readPort,
  readRedisUrl,
  readServiceName
} from '../../src/config.js';

test('config reads explicit values and defaults', () => {
  const previous = {
    BACKEND_URLS: process.env.BACKEND_URLS,
    INSTANCE_ID: process.env.INSTANCE_ID,
    PORT: process.env.PORT,
    REDIS_URL: process.env.REDIS_URL,
    SERVICE_NAME: process.env.SERVICE_NAME
  };

  delete process.env.BACKEND_URLS;
  delete process.env.INSTANCE_ID;
  delete process.env.PORT;
  delete process.env.REDIS_URL;
  delete process.env.SERVICE_NAME;

  assert.deepEqual(readBackendUrls(), ['http://127.0.0.1:3001', 'http://127.0.0.1:3002']);
  assert.equal(readInstanceId(), 'backend-a');
  assert.equal(readPort(), 3000);
  assert.equal(readRedisUrl(), 'redis://127.0.0.1:6379');
  assert.equal(readServiceName(), 'balancer');

  process.env.BACKEND_URLS = 'http://backend-a.internal,http://backend-b.internal';
  process.env.INSTANCE_ID = 'backend-b';
  process.env.PORT = '3010';
  process.env.REDIS_URL = 'redis://cache.internal:6379';
  process.env.SERVICE_NAME = 'backend';

  assert.deepEqual(readBackendUrls(), ['http://backend-a.internal', 'http://backend-b.internal']);
  assert.equal(readInstanceId(), 'backend-b');
  assert.equal(readPort(), 3010);
  assert.equal(readRedisUrl(), 'redis://cache.internal:6379');
  assert.equal(readServiceName(), 'backend');

  for (const [key, value] of Object.entries(previous)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
});
