import test from 'node:test';
import assert from 'node:assert/strict';
import {
  readAuthSecret,
  readAuthServiceUrl,
  readPaymentServiceUrl,
  readPort,
  readServiceName
} from '../../src/config.js';

test('config reads explicit values and defaults', () => {
  const previous = {
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL,
    PAYMENT_SERVICE_URL: process.env.PAYMENT_SERVICE_URL,
    PORT: process.env.PORT,
    SERVICE_NAME: process.env.SERVICE_NAME
  };

  delete process.env.AUTH_SECRET;
  delete process.env.AUTH_SERVICE_URL;
  delete process.env.PAYMENT_SERVICE_URL;
  delete process.env.PORT;
  delete process.env.SERVICE_NAME;

  assert.equal(readAuthSecret(), 'platform-secret');
  assert.equal(readAuthServiceUrl(), 'http://127.0.0.1:3000');
  assert.equal(readPaymentServiceUrl(), 'http://127.0.0.1:3002');
  assert.equal(readPort(), 3000);
  assert.equal(readServiceName(), 'auth');

  process.env.AUTH_SECRET = 'other-secret';
  process.env.AUTH_SERVICE_URL = 'http://auth.internal';
  process.env.PAYMENT_SERVICE_URL = 'http://payment.internal';
  process.env.PORT = '3010';
  process.env.SERVICE_NAME = 'user';

  assert.equal(readAuthSecret(), 'other-secret');
  assert.equal(readAuthServiceUrl(), 'http://auth.internal');
  assert.equal(readPaymentServiceUrl(), 'http://payment.internal');
  assert.equal(readPort(), 3010);
  assert.equal(readServiceName(), 'user');

  for (const [key, value] of Object.entries(previous)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
});
