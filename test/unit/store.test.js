import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createMessageStore, migrateDatabase } from '../../src/store.js';

test('message store migrates and returns room history in insert order', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'chat-store-'));
  const databasePath = join(directory, 'chat.sqlite');

  try {
    migrateDatabase(databasePath);

    const store = createMessageStore(databasePath);

    try {
      store.addMessage({
        room: 'general',
        user: 'alice',
        body: 'hello',
        createdAt: '2026-04-02T12:00:00.000Z'
      });
      store.addMessage({
        room: 'general',
        user: 'bob',
        body: 'hi',
        createdAt: '2026-04-02T12:00:01.000Z'
      });
      store.addMessage({
        room: 'other',
        user: 'carol',
        body: 'skip',
        createdAt: '2026-04-02T12:00:02.000Z'
      });

      assert.deepEqual(store.listMessages('general'), [
        {
          room: 'general',
          user: 'alice',
          body: 'hello',
          createdAt: '2026-04-02T12:00:00.000Z'
        },
        {
          room: 'general',
          user: 'bob',
          body: 'hi',
          createdAt: '2026-04-02T12:00:01.000Z'
        }
      ]);
    } finally {
      store.close();
    }
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
});
