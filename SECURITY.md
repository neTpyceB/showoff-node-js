# Security

## Current Position

- Only the documented HTTP endpoints accept queue traffic
- Redis connectivity is scoped to the queue and worker processes
- Job state is stored in Redis, not in process memory
- Invalid JSON requests are rejected with `400`
- No authentication is implemented because it is outside the current scope

## Verification

- `npm audit --audit-level=low`
- Docker build validation
- Containerized migration and check run
- Real Redis-backed queue flow over Docker
