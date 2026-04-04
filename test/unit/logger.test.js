import test from 'node:test';
import assert from 'node:assert/strict';
import { createLogger, formatLog } from '../../src/logger.js';

test('logger formats and writes json lines', () => {
  const lines = [];
  const logger = createLogger((line) => lines.push(line), () => '2026-04-04T12:00:00.000Z');

  assert.equal(formatLog({ status: 200 }), '{"status":200}');

  logger({ method: 'GET', path: '/service-a/hello', service: 'service-a', status: 200 });

  assert.deepEqual(lines, [
    '{"timestamp":"2026-04-04T12:00:00.000Z","method":"GET","path":"/service-a/hello","service":"service-a","status":200}\n'
  ]);
});
