import test from 'node:test';
import assert from 'node:assert/strict';
import { readBearerToken } from '../../src/auth.js';

test('readBearerToken extracts bearer tokens', () => {
  assert.equal(readBearerToken('Bearer token'), 'token');
  assert.equal(readBearerToken('Basic token'), null);
  assert.equal(readBearerToken(undefined), null);
});
