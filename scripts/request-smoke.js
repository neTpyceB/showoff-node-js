import assert from 'node:assert/strict';
import { assertMessage, connectClient } from './ws-client.js';

const baseUrl = process.env.API_URL ?? 'http://localhost:3000';
const room = `smoke-${Date.now()}`;
const alice = await connectClient(baseUrl, room, 'alice');

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

  const bob = await connectClient(baseUrl, room, 'bob');

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

    assertMessage(await alice.nextEvent(), {
      type: 'message',
      room,
      user: 'alice',
      body: 'hello'
    });
    assertMessage(await bob.nextEvent(), {
      type: 'message',
      room,
      user: 'alice',
      body: 'hello'
    });

    await alice.close();

    assert.deepEqual(await bob.nextEvent(), {
      type: 'presence',
      room,
      users: ['bob']
    });
  } finally {
    await bob.close();
  }
} finally {
  if (alice.socket.readyState !== alice.socket.CLOSED) {
    await alice.close();
  }
}

const replay = await connectClient(baseUrl, room, 'replay');

try {
  const history = await replay.nextEvent();

  assert.equal(history.type, 'history');
  assert.equal(history.room, room);
  assert.equal(history.messages.length, 1);
  assert.deepEqual(
    {
      room: history.messages[0].room,
      user: history.messages[0].user,
      body: history.messages[0].body
    },
    {
      room,
      user: 'alice',
      body: 'hello'
    }
  );
  assert.match(history.messages[0].createdAt, /^\d{4}-\d{2}-\d{2}T/);
  assert.deepEqual(await replay.nextEvent(), {
    type: 'presence',
      room,
      users: ['replay']
    }
  );
} catch (error) {
  if (replay.socket.readyState !== replay.socket.CLOSED) {
    await replay.close();
  }

  throw error;
}

await replay.close();
process.stdout.write('Realtime smoke passed\n');
