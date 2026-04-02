# Security

## Current Position

- Only the documented WebSocket route accepts chat traffic
- Plain HTTP requests do not expose chat data and return `426`
- Messages are persisted only to the local SQLite database configured by `DATABASE_PATH`
- Invalid WebSocket payloads are rejected by closing the socket
- No authentication is implemented because it is outside the current scope

## Verification

- `npm audit --audit-level=low`
- Docker build validation
- Containerized migration and check run
- Real WebSocket chat flow over Docker
