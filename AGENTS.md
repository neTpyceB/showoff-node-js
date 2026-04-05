# AGENTS

## Project Goal

Teach scaling and observability fundamentals through a minimal high-performance system.

## Non-Negotiables

- Keep scope locked to the documented caching, balancing, metrics, logging, and health surface.
- Do not add extra entities, endpoints, or fallback logic.
- Keep docs synchronized with the real repository state.
- Run migrations, lint, coverage, audit, and Docker validation after code changes.

## Current Surface

- Public routes: `GET /records/:id`, `GET /metrics`, `GET /health`
- Balancer: round-robin across two backend instances
- Cache: shared Redis
- Runtime: Node `25.9.0`
- Local run: `docker compose up --build`
- Full verification: `make check && make docker-up && make request-smoke && make docker-test && make docker-down`
