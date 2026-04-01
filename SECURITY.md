# Security

## Current Position

- Passwords are stored only as salted `scrypt` hashes
- JWT bearer tokens are required for protected routes
- Role checks gate `/admin`
- Error responses do not expose stack traces

## Verification

- `npm audit --audit-level=low`
- Docker build validation
- Containerized check run
- Real auth flow over Dockerized HTTP
