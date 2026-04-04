import test from 'node:test';
import assert from 'node:assert/strict';
import {
  readAuthToken,
  readPort,
  readRateLimitLimit,
  readRateLimitWindowMs,
  readRoutes,
  readServiceName
} from '../../src/config.js';

test('config reads explicit values and defaults', () => {
  assert.equal(readPort({ PORT: '4321' }), 4321);
  assert.equal(readPort({}), 3000);
  assert.equal(readAuthToken({ AUTH_TOKEN: 'token' }), 'token');
  assert.equal(readAuthToken({}), 'platform-token');
  assert.equal(readRateLimitLimit({ RATE_LIMIT_LIMIT: '3' }), 3);
  assert.equal(readRateLimitLimit({}), 2);
  assert.equal(readRateLimitWindowMs({ RATE_LIMIT_WINDOW_MS: '2000' }), 2000);
  assert.equal(readRateLimitWindowMs({}), 1000);
  assert.deepEqual(readRoutes({ SERVICE_A_URL: 'http://a', SERVICE_B_URL: 'http://b' }), [
    { prefix: '/service-a', service: 'service-a', targetUrl: 'http://a' },
    { prefix: '/service-b', service: 'service-b', targetUrl: 'http://b' }
  ]);
  assert.deepEqual(readRoutes({}), [
    { prefix: '/service-a', service: 'service-a', targetUrl: 'http://127.0.0.1:3001' },
    { prefix: '/service-b', service: 'service-b', targetUrl: 'http://127.0.0.1:3002' }
  ]);
  assert.equal(readServiceName({ SERVICE_NAME: 'service-a' }), 'service-a');
  assert.equal(readServiceName({}), 'service');
});
