# AGENTS

## Project Goal

Teach distributed-backend fundamentals through a minimal multi-service system.

## Non-Negotiables

- Keep scope locked to the documented service contracts.
- Do not add extra entities, endpoints, or fallback logic.
- Keep docs synchronized with the real repository state.
- Run migrations, lint, coverage, audit, and Docker validation after code changes.

## Current Surface

- Auth service: `POST /register`, `POST /login`, `GET /verify`
- User service: `GET /users/me`, `POST /users/me/payments`
- Payment service: `POST /payments`
- Runtime: Node `25.9.0`
- Local run: `docker compose up --build`
- Full verification: `make check && make docker-up && make request-smoke && make docker-test && make docker-down`
