# AGENTS

## Project Goal

Teach platform-entrypoint fundamentals through a minimal API gateway.

## Non-Negotiables

- Keep scope locked to the documented gateway surface.
- Do not add extra entities, endpoints, or fallback logic.
- Keep docs synchronized with the real repository state.
- Run migrations, lint, coverage, audit, and Docker validation after code changes.

## Current Surface

- Gateway routes: `/service-a/*`, `/service-b/*`
- Auth: `Authorization: Bearer <token>`
- Rate limiting: fixed window in the gateway
- Logging: JSON lines from the gateway process
- Runtime: Node `24.14.1`
- Local run: `docker compose up --build`
- Full verification: `make check && make docker-up && make request-smoke && make docker-test && make docker-down`
