import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from '../../src/app.js';

test('http requests receive upgrade required', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'chat-app-'));
  const databasePath = join(directory, 'chat.sqlite');
  const app = createApp({ databasePath });

  try {
    await new Promise((resolve) => {
      app.server.listen(0, '127.0.0.1', resolve);
    });

    const { port } = app.server.address();
    const response = await fetch(`http://127.0.0.1:${port}`);

    assert.equal(response.status, 426);
    assert.equal(await response.text(), '{"error":"WebSocket upgrade required"}');
  } finally {
    await app.close();
    await rm(directory, { force: true, recursive: true });
  }
});
