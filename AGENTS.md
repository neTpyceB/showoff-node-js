# AGENTS

## Project Goal

Teach core Node.js runtime usage through a minimal CLI file manager.

## Non-Negotiables

- Keep scope locked to the documented feature list.
- Prefer core Node APIs over external libraries.
- Do not add fallback logic, extra commands, or extra data models.
- Keep docs synchronized with the real repository state.
- Run lint, coverage, audit, and Docker validation after code changes.

## Current Surface

- Commands: `pwd`, `ls`, `cd`, `up`, `read`, `write`, `find`, `stream`
- Runtime: Node `24.14.1`
- Local run: `docker compose run --rm app`
- Full verification: `make check && make docker-test && make docker-smoke`
