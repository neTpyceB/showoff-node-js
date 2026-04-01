import test from 'node:test';
import assert from 'node:assert/strict';
import { createLoggerMiddleware } from '../../src/middleware/logger.js';

test('logger middleware records completed requests', () => {
  const entries = [];
  let finish;
  const middleware = createLoggerMiddleware({
    info(entry, message) {
      entries.push({ entry, message });
    }
  });

  middleware(
    { method: 'GET', originalUrl: '/items' },
    {
      statusCode: 200,
      on(event, callback) {
        if (event === 'finish') {
          finish = callback;
        }
      }
    },
    () => {}
  );

  finish();

  assert.equal(entries.length, 1);
  assert.equal(entries[0].message, 'request completed');
  assert.equal(entries[0].entry.method, 'GET');
  assert.equal(entries[0].entry.path, '/items');
  assert.equal(entries[0].entry.statusCode, 200);
  assert.equal(typeof entries[0].entry.durationMs, 'number');
});
