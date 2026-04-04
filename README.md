# Scalable API Gateway

Minimal API gateway with service routing, bearer-token auth, fixed-window rate limiting, and request logging.

## Scope

- Route requests to multiple upstream services
- Enforce a gateway authentication layer
- Enforce rate limiting before proxying
- Log gateway request outcomes

## Stack

- Node.js `24.14.1` Active LTS
- Core modules: `http`
- No runtime npm dependencies
- ESLint `10.2.0`
- c8 `11.0.0`
- Docker Compose

## API

- Gateway routes:
- `GET /service-a/*`
- `GET /service-b/*`
- `POST /service-a/*`
- `POST /service-b/*`

Authentication:

```json
Authorization: Bearer platform-token
```

Example proxied response:

```json
{
  "body": "{\"task\":\"sync\"}",
  "method": "POST",
  "path": "/tasks",
  "service": "service-b"
}
```

Rate-limited response:

```json
{
  "error": "Rate limit exceeded"
}
```

Errors are returned as JSON:

```json
{
  "error": "Message"
}
```

## Local Run

```bash
docker compose up --build
```

The gateway listens on [http://localhost:3000](http://localhost:3000).

## Validation

```bash
make check
make docker-up
make request-smoke
make docker-test
make docker-down
```

`make check` runs the migration step, lint, 100% coverage, and `npm audit`. `make docker-test` runs the containerized migration, lint, and coverage path.
