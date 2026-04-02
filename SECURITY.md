# Security

## Current Position

- Request bodies are streamed directly instead of buffered into memory
- Unknown routes return JSON errors
- Invalid CSV and invalid JSON return JSON errors
- The service does not persist uploaded data

## Verification

- `npm audit --audit-level=low`
- Docker build validation
- Containerized check run
- Real streaming flow over Dockerized HTTP
