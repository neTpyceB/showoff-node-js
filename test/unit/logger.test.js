import test from 'node:test';
import assert from 'node:assert/strict';
import { createLogger, formatLog } from '../../src/logger.js';

test('logger formats and writes json lines', () => {
  let output = '';
  const log = createLogger((chunk) => {
    output += chunk;
  }, () => '2026-04-05T00:00:00.000Z');

  assert.equal(formatLog({ status: 200 }), '{"status":200}\n');
  log({ service: 'notifications', status: 'processed' });
  assert.equal(
    output,
    '{"service":"notifications","status":"processed","time":"2026-04-05T00:00:00.000Z"}\n'
  );
});

test('logger works with default stdout writer', () => {
  const originalWrite = process.stdout.write;
  let output = '';

  process.stdout.write = ((chunk) => {
    output += chunk;
    return true;
  });

  try {
    createLogger(undefined, () => '2026-04-05T00:00:00.000Z')({ service: 'audit', status: 'processed' });
  } finally {
    process.stdout.write = originalWrite;
  }

  assert.equal(output, '{"service":"audit","status":"processed","time":"2026-04-05T00:00:00.000Z"}\n');
});

test('logger works with default time factory', () => {
  const originalWrite = process.stdout.write;
  let output = '';

  process.stdout.write = ((chunk) => {
    output += chunk;
    return true;
  });

  try {
    createLogger()({ service: 'feed', status: 'processed' });
  } finally {
    process.stdout.write = originalWrite;
  }

  assert.match(output, /^\{"service":"feed","status":"processed","time":".+"\}\n$/);
});
