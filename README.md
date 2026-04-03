# Job Queue System

Minimal Redis-backed async job system with delayed jobs, retries, and a separate worker process.

## Scope

- Enqueue background jobs over HTTP
- Read job state over HTTP
- Process jobs in a separate worker process
- Delay job execution
- Retry failed jobs until they succeed or exhaust attempts

## Stack

- Node.js `24.14.1` Active LTS
- Core modules: `http`
- bullmq `5.73.0`
- ioredis `5.10.1`
- Redis `8.6.2-alpine`
- ESLint `10.1.0`
- c8 `11.0.0`
- Docker Compose

## API

- `POST /jobs`
- `GET /jobs/:id`

`POST /jobs`

```json
{
  "value": "hello",
  "delayMs": 400,
  "failUntilAttempt": 1
}
```

Response:

```json
{
  "id": "1"
}
```

`GET /jobs/:id`

```json
{
  "id": "1",
  "state": "completed",
  "attemptsMade": 1,
  "result": {
    "output": "HELLO"
  },
  "failedReason": null
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

The API listens on [http://localhost:3000](http://localhost:3000).

## Validation

```bash
make check
make docker-up
make request-smoke
make docker-test
make docker-down
```

`make check` runs the migration step, lint, 100% coverage, and `npm audit`. `make docker-test` runs the containerized migration, lint, and coverage path.
