import test from 'node:test';
import assert from 'node:assert/strict';
import { createMetrics } from '../../src/metrics.js';

test('metrics tracks requests, cache stats, and errors', () => {
  const metrics = createMetrics();

  metrics.recordRequest();
  metrics.recordCacheHit();
  metrics.recordCacheMiss();
  metrics.recordError();

  assert.deepEqual(metrics.snapshot(), {
    cacheHitsTotal: 1,
    cacheMissesTotal: 1,
    errorsTotal: 1,
    requestsTotal: 1
  });
});
