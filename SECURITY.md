# Security

## Current Position

- HTTP surface limited to the documented `items` endpoints
- Validation rejects invalid item ids and invalid item names
- Error responses are JSON and do not expose stack traces

## Verification

- `npm audit --audit-level=low`
- Docker build validation
- Containerized check run
