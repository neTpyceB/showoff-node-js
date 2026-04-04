import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { hashPassword, signToken, verifyPassword, verifyToken } from '../../src/crypto.js';

test('crypto hashes passwords and signs tokens', () => {
  const passwordHash = hashPassword('secret');
  const token = signToken({ email: 'user@example.com', id: 1 }, 'token-secret');
  const invalidPayload = Buffer.from('not-json').toString('base64url');
  const invalidToken = `${invalidPayload}.${createHmac('sha256', 'token-secret').update(invalidPayload).digest('base64url')}`;

  assert.equal(verifyPassword('secret', passwordHash), true);
  assert.equal(verifyPassword('wrong', passwordHash), false);
  assert.equal(verifyToken(null, 'token-secret'), null);
  assert.deepEqual(verifyToken(token, 'token-secret'), { email: 'user@example.com', id: 1 });
  assert.equal(verifyToken(token, 'wrong-secret'), null);
  assert.equal(verifyToken('bad-token', 'token-secret'), null);
  assert.equal(verifyToken(invalidToken, 'token-secret'), null);
});
