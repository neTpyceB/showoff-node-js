import test from 'node:test';
import assert from 'node:assert/strict';
import { createServiceHandler } from '../../src/service-factory.js';

test('service factory creates handlers', () => {
  assert.equal(typeof createServiceHandler({ authSecret: 'secret', serviceName: 'auth' }), 'function');
  assert.equal(
    typeof createServiceHandler({
      authServiceUrl: 'http://auth.test',
      paymentServiceUrl: 'http://payment.test',
      serviceName: 'user'
    }),
    'function'
  );
  assert.equal(typeof createServiceHandler({ serviceName: 'payment' }), 'function');
});

test('service factory rejects unknown services', () => {
  assert.throws(() => createServiceHandler({ serviceName: 'missing' }), {
    message: 'Unknown service: missing'
  });
});
