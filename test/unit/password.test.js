import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword } from '../../src/auth/password.js';

test('password hashing and verification work', () => {
  const hash = hashPassword('password123');

  assert.notEqual(hash, 'password123');
  assert.equal(verifyPassword('password123', hash), true);
  assert.equal(verifyPassword('wrong', hash), false);
});
