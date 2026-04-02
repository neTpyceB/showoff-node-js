import assert from 'node:assert/strict';
import WebSocket from 'ws';

export function toWebSocketUrl(baseUrl, room, user) {
  return `${baseUrl.replace(/^http/, 'ws')}/chat?room=${encodeURIComponent(room)}&user=${encodeURIComponent(user)}`;
}

export async function connectClient(baseUrl, room, user) {
  const socket = new WebSocket(toWebSocketUrl(baseUrl, room, user));
  const queue = [];
  const waiters = [];

  socket.on('message', (raw) => {
    const event = JSON.parse(raw.toString());
    const waiter = waiters.shift();

    if (waiter) {
      waiter(event);
      return;
    }

    queue.push(event);
  });

  await new Promise((resolve, reject) => {
    socket.once('open', resolve);
    socket.once('error', reject);
  });

  return {
    nextEvent: () =>
      queue.length > 0 ? Promise.resolve(queue.shift()) : new Promise((resolve) => waiters.push(resolve)),
    socket,
    close: async () => {
      await new Promise((resolve) => {
        socket.once('close', resolve);
        socket.close();
      });
    }
  };
}

export function assertMessage(event, expected) {
  assert.deepEqual(
    {
      body: event.body,
      room: event.room,
      type: event.type,
      user: event.user
    },
    expected
  );
  assert.match(event.createdAt, /^\d{4}-\d{2}-\d{2}T/);
}
