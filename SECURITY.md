# Security

## Current Position

- Only the documented routed paths are proxied by the gateway
- Upstream services are reachable through the gateway routing layer
- Unauthorized routed requests are rejected with `401`
- Rate-limited requests are rejected with `429`
- Invalid JSON requests are rejected with `400`
- No authentication is implemented because it is outside the current scope
  Correction: bearer-token authentication is implemented at the gateway because it is part of the current scope

## Verification

- `npm audit --audit-level=low`
- Docker build validation
- Containerized migration and check run
- Real gateway routing flow over Docker
