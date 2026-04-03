# AGENTS

## Project Goal

Teach async workload fundamentals through a minimal Redis-backed job queue.

## Non-Negotiables

- Keep scope locked to the documented queue surface.
- Do not add extra entities, endpoints, or fallback logic.
- Keep docs synchronized with the real repository state.
- Run migrations, lint, coverage, audit, and Docker validation after code changes.

## Current Surface

- Endpoints: `POST /jobs`, `GET /jobs/:id`
- Worker process: `src/worker.js`
- Redis queue: BullMQ on Redis
- Runtime: Node `24.14.1`
- Local run: `docker compose up --build`
- Full verification: `make check && make docker-up && make request-smoke && make docker-test && make docker-down`
