import test from 'node:test';
import assert from 'node:assert/strict';
import { createLoggerMiddleware } from '../../src/middleware/logger.js';

test('logger middleware writes a log line on finish', () => {
  const lines = [];
  let finish;
  const middleware = createLoggerMiddleware((line) => {
    lines.push(line);
  });

  middleware(
    { method: 'GET', originalUrl: '/auth/me' },
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

  const payload = JSON.parse(lines[0]);

  assert.equal(payload.method, 'GET');
  assert.equal(payload.path, '/auth/me');
  assert.equal(payload.statusCode, 200);
  assert.equal(typeof payload.durationMs, 'number');
});
