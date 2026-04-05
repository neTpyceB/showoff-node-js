import test from 'node:test';
import assert from 'node:assert/strict';
import { createLogger, formatLog } from '../../src/logger.js';

test('logger formats and writes json lines', () => {
  let output = '';
  const log = createLogger((chunk) => {
    output += chunk;
  }, () => '2026-04-05T00:00:00.000Z');

  assert.equal(formatLog({ status: 200 }), '{"status":200}\n');
  log({ method: 'GET', path: '/records/42', status: 200 });
  assert.equal(
    output,
    '{"method":"GET","path":"/records/42","status":200,"time":"2026-04-05T00:00:00.000Z"}\n'
  );
});
