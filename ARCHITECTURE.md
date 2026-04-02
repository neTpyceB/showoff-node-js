# Architecture

## Shape

- `src/app.js`: HTTP server creation and WebSocket attachment
- `src/server.js`: process entrypoint, env reading, and signal shutdown
- `src/chat.js`: room state, presence broadcasting, and message broadcasting
- `src/store.js`: SQLite migration and persisted message history
- `migrations/001_create_messages.sql`: message table schema

## Runtime

- One raw Node HTTP server accepts WebSocket upgrades on `/chat`.
- Each connection belongs to exactly one room and one user from the query string.
- Room state is held in memory as `room -> user -> sockets`.
- On connect, the server sends persisted room history first, then broadcasts current presence.
- On message, the server stores the payload in SQLite and broadcasts it to every socket in the room.
- On disconnect, the server updates presence for the remaining room members.

## Test Layers

- Unit: store migration, store reads, server config, and HTTP upgrade response
- Integration: room presence, broadcasting, persistence, invalid protocol handling
- E2E: spawned server process over real WebSocket traffic
- Smoke: startup plus a minimal persisted chat flow
