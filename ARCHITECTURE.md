# Architecture

## Shape

- `src/app.js`: HTTP handler for enqueue and job status
- `src/config.js`: env-based runtime configuration
- `src/job-service.js`: queue-facing enqueue and status mapping
- `src/processor.js`: worker job execution logic and retry trigger
- `src/runtime.js`: BullMQ and Redis wiring
- `src/server.js`: API process entrypoint
- `src/worker.js`: worker process entrypoint

## Runtime

- The API process writes jobs into a BullMQ queue stored in Redis.
- Each job contains the requested value, delay, and the attempt number that should still fail.
- The worker process consumes jobs from Redis independently of the API process.
- The processor throws until `attemptsMade` reaches `failUntilAttempt`, which exercises retry behavior.
- Successful jobs return an uppercase result payload and failed jobs expose `failedReason`.

## Test Layers

- Unit: config, processor, queue service, runtime wiring, and handler behavior
- Integration: full HTTP enqueue and job status flow
- E2E: spawned API process over real HTTP
- Smoke: startup plus a minimal completed job flow
