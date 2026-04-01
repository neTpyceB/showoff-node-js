# Security

## Current Position

- No network surface
- No third-party runtime dependencies
- File access is limited to paths the operator chooses to open from the current working directory context

## Verification

- `npm audit --audit-level=low`
- Docker build validation
- Containerized check run
