# Multi-service Backend

Minimal distributed backend with three services:

- auth service
- user service
- payment mock service

## Scope

- service-to-service communication
- explicit HTTP contracts
- Docker multi-container local runtime

## Services

- Auth service on `:3000`
  - `POST /register`
  - `POST /login`
  - `GET /verify`
- User service on `:3001`
  - `GET /users/me`
  - `POST /users/me/payments`
- Payment service on `:3002`
  - `POST /payments`

## Stack

- Node.js `25.9.0`
- Core modules only at runtime
- ESLint `10.2.0`
- c8 `11.0.0`
- Docker Compose

## Local Run

```bash
docker compose up --build
```

## Validation

```bash
make check
make docker-up
make request-smoke
make docker-test
make docker-down
```
