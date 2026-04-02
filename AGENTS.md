# AGENTS

## Project Goal

Teach realtime backend fundamentals through a minimal WebSocket chat service.

## Non-Negotiables

- Keep scope locked to the documented chat surface.
- Do not add extra entities, endpoints, or fallback logic.
- Keep docs synchronized with the real repository state.
- Run migrations, lint, coverage, audit, and Docker validation after code changes.

## Current Surface

- WebSocket route: `/chat?room=<room>&user=<user>`
- Inbound event: `{"type":"message","body":"..."}`
- Outbound events: `history`, `presence`, `message`
- Runtime: Node `24.14.1`
- Local run: `docker compose up --build`
- Full verification: `make check && make docker-up && make request-smoke && make docker-test && make docker-down`
