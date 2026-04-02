# AGENTS

## Project Goal

Teach stream-based data processing through a minimal HTTP service for large CSV and JSON files.

## Non-Negotiables

- Keep scope locked to the documented transform surface.
- Do not add extra entities, endpoints, or fallback logic.
- Keep docs synchronized with the real repository state.
- Run lint, coverage, audit, and Docker validation after code changes.

## Current Surface

- Endpoints: `POST /transform/csv-to-ndjson`, `POST /transform/json-to-csv`
- Runtime: Node `24.14.1`
- Local run: `docker compose up --build`
- Full verification: `make check && make docker-up && make request-smoke && make docker-test && make docker-down`
