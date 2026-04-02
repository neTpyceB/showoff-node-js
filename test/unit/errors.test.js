import test from 'node:test';
import assert from 'node:assert/strict';
import { mapError } from '../../src/errors.js';

test('mapError classifies csv and json parser errors', () => {
  assert.deepEqual(mapError({ code: 'CSV_RECORD_INCONSISTENT_COLUMNS' }), {
    status: 400,
    message: 'Invalid CSV'
  });
  assert.deepEqual(mapError({ message: 'Parser cannot parse input: expected an object key' }), {
    status: 400,
    message: 'Invalid JSON'
  });
  assert.deepEqual(mapError({ message: 'Top-level object should be an array.' }), {
    status: 400,
    message: 'Invalid JSON'
  });
});

test('mapError falls back to internal server error', () => {
  assert.deepEqual(mapError(new Error('boom')), {
    status: 500,
    message: 'Internal server error'
  });
});
