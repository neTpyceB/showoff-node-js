# Architecture

## Shape

- `src/app.js`: Express app composition
- `src/server.js`: HTTP server entrypoint
- `src/items/router.js`: CRUD routes
- `src/items/store.js`: in-memory item storage
- `src/items/validators.js`: request validation
- `src/middleware/logger.js`: request logging middleware
- `src/middleware/errors.js`: not-found and error middleware

## Runtime

- The app exposes a single `items` resource.
- Storage is process-local memory because no database was required.
- Validation accepts only the required payload field: `name`.
- Errors are returned as JSON with HTTP status codes.
- Each request is logged with method, path, status code, and duration.

## Test Layers

- Unit: validators, store, logger, and error middleware
- Integration: app behavior through Express without opening a network port
- E2E: spawned server process over real HTTP
- Smoke: startup plus a minimal real request
