import test from 'node:test';
import assert from 'node:assert/strict';
import { parseItemId, parseItemName } from '../../src/items/validators.js';

test('parseItemId accepts positive integer strings', () => {
  assert.equal(parseItemId('1'), 1);
});

test('parseItemId rejects invalid values', () => {
  assert.throws(() => parseItemId('0'), /Invalid item id/);
  assert.throws(() => parseItemId('01'), /Invalid item id/);
  assert.throws(() => parseItemId('abc'), /Invalid item id/);
});

test('parseItemName accepts the required payload', () => {
  assert.equal(parseItemName({ name: 'first' }), 'first');
});

test('parseItemName rejects invalid payloads', () => {
  assert.throws(() => parseItemName({}), /Invalid item name/);
  assert.throws(() => parseItemName({ name: '' }), /Invalid item name/);
  assert.throws(() => parseItemName(null), /Invalid item name/);
});
