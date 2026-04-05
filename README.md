# Event-driven Platform

Minimal distributed platform with:

- Redis Streams event bus
- notifications service
- activity feed service
- audit logging service
- retry of unacknowledged events

## Surface

- `POST /events`
- `GET /notifications/:userId`
- `GET /feed/:userId`
- `GET /audit`
- `GET /health`

Publish payload:

```json
{
  "message": "created order",
  "userId": "user-1"
}
```

## Stack

- Node.js `25.9.0`
- Redis client `5.11.0`
- Redis `8.6.1-alpine`
- ESLint `10.2.0`
- c8 `11.0.0`
- Docker Compose

## Local Run

```bash
docker compose up --build
```

The public API is [http://localhost:3000](http://localhost:3000).

## Validation

```bash
make check
make docker-up
make request-smoke
make docker-test
make docker-down
```
