import test from 'node:test';
import assert from 'node:assert/strict';
import { readDatabasePath, readPort, shutdownApp } from '../../src/server.js';

test('server reads explicit env values and defaults', () => {
  assert.equal(readPort({ PORT: '4321' }), 4321);
  assert.equal(readPort({}), 3000);
  assert.equal(readDatabasePath({ DATABASE_PATH: '/tmp/chat.sqlite' }), '/tmp/chat.sqlite');
  assert.equal(readDatabasePath({}), 'tmp/chat.sqlite');
});

test('shutdownApp exits with success and failure codes', async () => {
  const codes = [];
  const exit = (code) => {
    codes.push(code);
  };

  await shutdownApp({ close: () => Promise.resolve() }, exit, 0);
  await shutdownApp({ close: () => Promise.reject(new Error('close failed')) }, exit, 0);

  assert.deepEqual(codes, [0, 1]);
});
