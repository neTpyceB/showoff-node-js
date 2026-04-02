import test from 'node:test';
import assert from 'node:assert/strict';
import { issueToken, verifyToken } from '../../src/auth/tokens.js';

test('tokens are issued and verified', () => {
  const token = issueToken({ id: 7, role: 'admin' }, 'secret');
  const payload = verifyToken(token, 'secret');

  assert.equal(payload.sub, '7');
  assert.equal(payload.role, 'admin');
});
