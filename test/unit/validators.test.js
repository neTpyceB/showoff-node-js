import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCredentials, parseEmail, parsePassword } from '../../src/auth/validators.js';

test('validators accept valid credentials', () => {
  assert.equal(parseEmail('user@example.com'), 'user@example.com');
  assert.equal(parsePassword('password123'), 'password123');
  assert.deepEqual(parseCredentials({ email: 'user@example.com', password: 'password123' }), {
    email: 'user@example.com',
    password: 'password123'
  });
});

test('validators reject invalid credentials', () => {
  assert.throws(() => parseEmail('userexample.com'), /Invalid email/);
  assert.throws(() => parsePassword(''), /Invalid password/);
  assert.throws(() => parseCredentials({ email: '', password: '' }), /Invalid email/);
});
