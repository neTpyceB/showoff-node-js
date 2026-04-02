# Architecture

## Shape

- `src/app.js`: route dispatch and response handling
- `src/server.js`: HTTP server entrypoint
- `src/errors.js`: error mapping and JSON error responses
- `src/transforms/csv-to-ndjson.js`: streamed CSV parsing to NDJSON export
- `src/transforms/json-to-csv.js`: streamed JSON array parsing to CSV export

## Runtime

- The service uses raw Node HTTP request and response streams.
- Each endpoint is implemented as a `pipeline(...)` chain, so backpressure is handled by Node streams.
- CSV input is parsed row by row and exported as NDJSON.
- JSON input is parsed as a streamed array and exported as CSV.
- Results are written directly to the response stream instead of buffering entire files in memory.

## Test Layers

- Unit: transform pipelines and error mapping
- Integration: full handler flows through HTTP
- E2E: spawned server process over real HTTP
- Smoke: startup plus a minimal streaming request
