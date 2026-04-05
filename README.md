# High-performance System

Minimal production-shaped system with:

- Redis caching
- load balancing across two backend instances
- metrics and JSON-line logs
- health checks

## Surface

- `GET /records/:id`
- `GET /metrics`
- `GET /health`

`GET /records/:id` returns:

```json
{
  "cached": false,
  "id": "42",
  "instanceId": "backend-a",
  "value": "value-42"
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

The entrypoint is [http://localhost:3000](http://localhost:3000).

## Validation

```bash
make check
make docker-up
make request-smoke
make docker-test
make docker-down
```
