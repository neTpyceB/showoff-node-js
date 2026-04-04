import test from 'node:test';
import assert from 'node:assert/strict';
import { createRateLimiter } from '../../src/rate-limit.js';

test('rate limiter allows within the window and resets after expiry', () => {
  let current = 1000;
  const limiter = createRateLimiter({
    limit: 2,
    now: () => current,
    windowMs: 100
  });

  assert.deepEqual(limiter.check('client'), { allowed: true, remaining: 1, resetAt: 1100 });
  assert.deepEqual(limiter.check('client'), { allowed: true, remaining: 0, resetAt: 1100 });
  assert.deepEqual(limiter.check('client'), { allowed: false, remaining: 0, resetAt: 1100 });

  current = 1100;

  assert.deepEqual(limiter.check('client'), { allowed: true, remaining: 1, resetAt: 1200 });
});
