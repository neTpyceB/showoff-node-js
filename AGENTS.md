# AGENTS

## Project Goal

Teach event-driven distributed-system fundamentals through a minimal Redis Streams platform.

## Non-Negotiables

- Keep scope locked to the documented event bus, projections, and retry surface.
- Do not add extra entities, endpoints, or fallback logic.
- Keep docs synchronized with the real repository state.
- Run migrations, lint, coverage, audit, and Docker validation after code changes.

## Current Surface

- API routes: `POST /events`, `GET /notifications/:userId`, `GET /feed/:userId`, `GET /audit`, `GET /health`
- Worker services: `notifications`, `feed`, `audit`
- Event bus: Redis Streams
- Runtime: Node `25.9.0`
- Local run: `docker compose up --build`
- Full verification: `make check && make docker-up && make request-smoke && make docker-test && make docker-down`
