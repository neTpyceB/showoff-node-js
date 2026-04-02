# Realtime Chat Backend

Minimal WebSocket chat backend with rooms, message broadcasting, presence tracking, and SQLite message persistence.

## Scope

- Rooms through the WebSocket query string
- Message broadcasting inside a room
- Presence updates on join and leave
- Persisted room history on reconnect

## Stack

- Node.js `24.14.1` Active LTS
- Core modules: `http`
- ws `8.20.0`
- better-sqlite3 `12.8.0`
- ESLint `10.1.0`
- c8 `11.0.0`
- Docker Compose

## Protocol

- WebSocket route: `ws://localhost:3000/chat?room=<room>&user=<user>`
- Inbound event:

```json
{ "type": "message", "body": "hello" }
```

- Outbound history event:

```json
{
  "type": "history",
  "room": "general",
  "messages": [
    {
      "room": "general",
      "user": "alice",
      "body": "hello",
      "createdAt": "2026-04-02T12:00:00.000Z"
    }
  ]
}
```

- Outbound presence event:

```json
{
  "type": "presence",
  "room": "general",
  "users": ["alice", "bob"]
}
```

- Outbound message event:

```json
{
  "type": "message",
  "room": "general",
  "user": "alice",
  "body": "hello",
  "createdAt": "2026-04-02T12:00:00.000Z"
}
```

Plain HTTP requests return `426` with `{"error":"WebSocket upgrade required"}`.

## Local Run

```bash
docker compose up --build
```

The backend listens on [http://localhost:3000](http://localhost:3000) for HTTP upgrade and [ws://localhost:3000/chat](ws://localhost:3000/chat) for chat clients.

## Validation

```bash
make check
make docker-up
make request-smoke
make docker-test
make docker-down
```

`make check` runs migrations, lint, 100% coverage, and `npm audit`. `make docker-test` runs the containerized migration, lint, and coverage path.
