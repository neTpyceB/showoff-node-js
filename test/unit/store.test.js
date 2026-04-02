import test from 'node:test';
import assert from 'node:assert/strict';
import { createUserStore } from '../../src/auth/store.js';

test('store creates and finds users', () => {
  const store = createUserStore();
  const admin = store.create({ email: 'admin@example.com', passwordHash: 'hash', role: 'admin' });
  const user = store.create({ email: 'user@example.com', passwordHash: 'hash-2', role: 'user' });

  assert.deepEqual(admin, { id: 1, email: 'admin@example.com', passwordHash: 'hash', role: 'admin' });
  assert.deepEqual(user, { id: 2, email: 'user@example.com', passwordHash: 'hash-2', role: 'user' });
  assert.equal(store.findByEmail('admin@example.com'), admin);
  assert.equal(store.findByEmail('missing@example.com'), null);
  assert.equal(store.findById(2), user);
  assert.equal(store.findById(3), null);
});
