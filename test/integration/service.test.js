import test from 'node:test';
import assert from 'node:assert/strict';
import WebSocket from 'ws';
import { startServer } from '../helpers/server.js';
import { connectClient, waitForClose } from '../helpers/ws.js';

test('chat server broadcasts messages and tracks presence inside a room', async () => {
  const server = await startServer();
  const room = 'general';
  const alice = await connectClient(server.url, room, 'alice');

  try {
    assert.deepEqual(await alice.nextEvent(), {
      type: 'history',
      room,
      messages: []
    });
    assert.deepEqual(await alice.nextEvent(), {
      type: 'presence',
      room,
      users: ['alice']
    });

    const bob = await connectClient(server.url, room, 'bob');

    try {
      assert.deepEqual(await bob.nextEvent(), {
        type: 'history',
        room,
        messages: []
      });
      assert.deepEqual(await bob.nextEvent(), {
        type: 'presence',
        room,
        users: ['alice', 'bob']
      });
      assert.deepEqual(await alice.nextEvent(), {
        type: 'presence',
        room,
        users: ['alice', 'bob']
      });

      alice.socket.send(JSON.stringify({ type: 'message', body: 'hello' }));

      const aliceMessage = await alice.nextEvent();
      const bobMessage = await bob.nextEvent();

      assert.equal(aliceMessage.type, 'message');
      assert.equal(aliceMessage.room, room);
      assert.equal(aliceMessage.user, 'alice');
      assert.equal(aliceMessage.body, 'hello');
      assert.match(aliceMessage.createdAt, /^\d{4}-\d{2}-\d{2}T/);
      assert.deepEqual(bobMessage, aliceMessage);

      await bob.close();

      assert.deepEqual(await alice.nextEvent(), {
        type: 'presence',
        room,
        users: ['alice']
      });
    } finally {
      if (bob.socket.readyState !== WebSocket.CLOSED) {
        await bob.close();
      }
    }
  } finally {
    if (alice.socket.readyState !== WebSocket.CLOSED) {
      await alice.close();
    }

    await server.close();
  }
});

test('chat server persists room messages and keeps rooms isolated', async () => {
  const server = await startServer();
  const alice = await connectClient(server.url, 'general', 'alice');

  try {
    await alice.nextEvent();
    await alice.nextEvent();
    alice.socket.send(JSON.stringify({ type: 'message', body: 'saved' }));

    const savedMessage = await alice.nextEvent();

    await alice.close();

    const replay = await connectClient(server.url, 'general', 'replay');

    try {
      const history = await replay.nextEvent();

      assert.equal(history.type, 'history');
      assert.equal(history.room, 'general');
      assert.deepEqual(history.messages, [
        {
          room: 'general',
          user: 'alice',
          body: 'saved',
          createdAt: savedMessage.createdAt
        }
      ]);
      assert.deepEqual(await replay.nextEvent(), {
        type: 'presence',
        room: 'general',
        users: ['replay']
      });
    } finally {
      await replay.close();
    }

    const otherRoom = await connectClient(server.url, 'other', 'bob');

    try {
      assert.deepEqual(await otherRoom.nextEvent(), {
        type: 'history',
        room: 'other',
        messages: []
      });
      assert.deepEqual(await otherRoom.nextEvent(), {
        type: 'presence',
        room: 'other',
        users: ['bob']
      });
    } finally {
      await otherRoom.close();
    }
  } finally {
    if (alice.socket.readyState !== WebSocket.CLOSED) {
      await alice.close();
    }

    await server.close();
  }
});

test('chat server closes invalid websocket sessions and plain http requires upgrade', async () => {
  const server = await startServer();

  try {
    const response = await fetch(server.url);

    assert.equal(response.status, 426);
    assert.equal(await response.text(), '{"error":"WebSocket upgrade required"}');

    const missing = new WebSocket(`${server.url.replace(/^http/, 'ws')}/chat?user=alice`);
    const missingClosed = waitForClose(missing);

    await new Promise((resolve, reject) => {
      missing.once('open', resolve);
      missing.once('error', reject);
    });

    assert.deepEqual(await missingClosed, {
      code: 1008,
      reason: 'room_and_user_required'
    });

    const invalid = await connectClient(server.url, 'general', 'alice');

    try {
      await invalid.nextEvent();
      await invalid.nextEvent();

      const closed = waitForClose(invalid.socket);

      invalid.socket.send('not-json');

      assert.deepEqual(await closed, {
        code: 1003,
        reason: 'invalid_json'
      });
    } finally {
      if (invalid.socket.readyState !== WebSocket.CLOSED) {
        await invalid.close();
      }
    }

    const wrongShape = await connectClient(server.url, 'general', 'bob');

    try {
      await wrongShape.nextEvent();
      await wrongShape.nextEvent();

      const closed = waitForClose(wrongShape.socket);

      wrongShape.socket.send(JSON.stringify({ type: 'presence' }));

      assert.deepEqual(await closed, {
        code: 1003,
        reason: 'invalid_message'
      });
    } finally {
      if (wrongShape.socket.readyState !== WebSocket.CLOSED) {
        await wrongShape.close();
      }
    }
  } finally {
    await server.close();
  }
});
