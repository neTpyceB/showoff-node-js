import test from 'node:test';
import assert from 'node:assert/strict';
import { isAuthorized, readBearerToken } from '../../src/auth.js';

test('auth reads bearer tokens and validates them', () => {
  assert.equal(readBearerToken('Bearer token'), 'token');
  assert.equal(readBearerToken('Basic token'), null);
  assert.equal(readBearerToken(undefined), null);
  assert.equal(isAuthorized('Bearer token', 'token'), true);
  assert.equal(isAuthorized('Bearer other', 'token'), false);
});
