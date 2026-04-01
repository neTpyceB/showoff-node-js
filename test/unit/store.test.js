import test from 'node:test';
import assert from 'node:assert/strict';
import { createItemStore } from '../../src/items/store.js';

test('store supports create, read, update, delete, and list', () => {
  const store = createItemStore();

  assert.deepEqual(store.list(), []);

  const first = store.create('first');
  const second = store.create('second');

  assert.deepEqual(first, { id: 1, name: 'first' });
  assert.deepEqual(second, { id: 2, name: 'second' });
  assert.deepEqual(store.list(), [first, second]);
  assert.deepEqual(store.get(1), first);
  assert.equal(store.get(3), null);
  assert.deepEqual(store.update(2, 'updated'), { id: 2, name: 'updated' });
  assert.equal(store.update(3, 'missing'), null);
  assert.equal(store.remove(1), true);
  assert.equal(store.remove(1), false);
  assert.deepEqual(store.list(), [{ id: 2, name: 'updated' }]);
});
