import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import WebSocket from 'ws';
import { connectClient } from '../helpers/ws.js';

async function waitForServer(baseUrl) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const socket = await connectClient(baseUrl, `ready-${attempt}`, 'probe');
      await socket.close();
      return;
    } catch {}

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error('Server did not start');
}

async function stopServer(server) {
  if (server.exitCode !== null || server.signalCode !== null) {
    return;
  }

  await new Promise((resolve) => {
    server.once('close', resolve);
    server.kill('SIGINT');
  });
}

test('server handles realtime chat flow over a real process', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'chat-e2e-'));
  const databasePath = join(directory, 'chat.sqlite');
  const port = 3100 + Math.floor(Math.random() * 1000);
  const baseUrl = `http://127.0.0.1:${port}`;
  const server = spawn(process.execPath, ['src/server.js'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      DATABASE_PATH: databasePath,
      PORT: String(port)
    },
    stdio: 'ignore'
  });

  try {
    await waitForServer(baseUrl);

    const alice = await connectClient(baseUrl, 'general', 'alice');

    try {
      await alice.nextEvent();
      await alice.nextEvent();
      alice.socket.send(JSON.stringify({ type: 'message', body: 'hello' }));

      const message = await alice.nextEvent();

      assert.equal(message.type, 'message');
      assert.equal(message.room, 'general');
      assert.equal(message.user, 'alice');
      assert.equal(message.body, 'hello');

      const bob = await connectClient(baseUrl, 'general', 'bob');

      try {
        const history = await bob.nextEvent();

        assert.equal(history.type, 'history');
        assert.equal(history.room, 'general');
        assert.deepEqual(history.messages, [
          {
            room: 'general',
            user: 'alice',
            body: 'hello',
            createdAt: message.createdAt
          }
        ]);
        assert.deepEqual(await bob.nextEvent(), {
          type: 'presence',
          room: 'general',
          users: ['alice', 'bob']
        });
        assert.deepEqual(await alice.nextEvent(), {
          type: 'presence',
          room: 'general',
          users: ['alice', 'bob']
        });
      } finally {
        await bob.close();
      }
    } finally {
      if (alice.socket.readyState !== WebSocket.CLOSED) {
        await alice.close();
      }
    }
  } finally {
    await stopServer(server);
    await rm(directory, { force: true, recursive: true });
  }
});
