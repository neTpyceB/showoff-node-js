import { WebSocket, WebSocketServer } from 'ws';

function forEachSocket(room, callback) {
  for (const sockets of room.users.values()) {
    for (const socket of sockets) {
      callback(socket);
    }
  }
}

function sendJson(socket, payload) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
  }
}

function getRoom(rooms, roomName) {
  if (!rooms.has(roomName)) {
    rooms.set(roomName, { users: new Map() });
  }

  return rooms.get(roomName);
}

function addConnection(room, userName, socket) {
  if (!room.users.has(userName)) {
    room.users.set(userName, new Set());
  }

  room.users.get(userName).add(socket);
}

function removeConnection(rooms, roomName, userName, socket) {
  const room = rooms.get(roomName);
  const sockets = room.users.get(userName);

  if (sockets) {
    sockets.delete(socket);

    if (sockets.size === 0) {
      room.users.delete(userName);
    }
  }

  if (room.users.size === 0) {
    rooms.delete(roomName);
    return null;
  }

  return room;
}

function broadcastPresence(roomName, room) {
  const payload = {
    type: 'presence',
    room: roomName,
    users: [...room.users.keys()]
  };

  forEachSocket(room, (socket) => sendJson(socket, payload));
}

function broadcastMessage(room, message) {
  const payload = {
    type: 'message',
    ...message
  };

  forEachSocket(room, (socket) => sendJson(socket, payload));
}

export function createChatServer({ server, store }) {
  const rooms = new Map();
  const wss = new WebSocketServer({ path: '/chat', server });

  wss.on('connection', (socket, request) => {
    const url = new URL(request.url, 'http://localhost');
    const roomName = url.searchParams.get('room');
    const userName = url.searchParams.get('user');

    if (!roomName || !userName) {
      socket.close(1008, 'room_and_user_required');
      return;
    }

    const room = getRoom(rooms, roomName);
    addConnection(room, userName, socket);

    sendJson(socket, {
      type: 'history',
      room: roomName,
      messages: store.listMessages(roomName)
    });
    broadcastPresence(roomName, room);

    socket.on('message', (raw) => {
      let payload;

      try {
        payload = JSON.parse(raw.toString());
      } catch {
        socket.close(1003, 'invalid_json');
        return;
      }

      if (payload.type !== 'message' || typeof payload.body !== 'string') {
        socket.close(1003, 'invalid_message');
        return;
      }

      const message = store.addMessage({
        body: payload.body,
        createdAt: new Date().toISOString(),
        room: roomName,
        user: userName
      });

      broadcastMessage(room, message);
    });

    socket.on('close', () => {
      const nextRoom = removeConnection(rooms, roomName, userName, socket);

      if (nextRoom) {
        broadcastPresence(roomName, nextRoom);
      }
    });
  });

  return wss;
}
