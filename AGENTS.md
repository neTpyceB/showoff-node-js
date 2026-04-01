# AGENTS

## Project Goal

Teach authentication and authorization fundamentals through a minimal auth backend.

## Non-Negotiables

- Keep scope locked to the documented auth surface.
- Do not add extra entities, endpoints, or fallback logic.
- Keep docs synchronized with the real repository state.
- Run lint, coverage, audit, and Docker validation after code changes.

## Current Surface

- Endpoints: `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `GET /admin`
- Runtime: Node `24.14.1`
- Local run: `docker compose up --build`
- Full verification: `make check && make docker-up && make request-smoke && make docker-test && make docker-down`
