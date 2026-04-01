# AGENTS

## Project Goal

Teach backend fundamentals through a minimal Express CRUD API.

## Non-Negotiables

- Keep scope locked to the documented API contract.
- Do not add extra fields, endpoints, or fallback logic.
- Keep docs synchronized with the real repository state.
- Run lint, coverage, audit, and Docker validation after code changes.

## Current Surface

- Resource: `items`
- Endpoints: `GET /items`, `GET /items/:id`, `POST /items`, `PUT /items/:id`, `DELETE /items/:id`
- Runtime: Node `24.14.1`
- Local run: `docker compose up --build`
- Full verification: `make check && make docker-up && make request-smoke && make docker-test && make docker-down`
