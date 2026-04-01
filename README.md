# Auth Service

Minimal Express.js auth backend built to practice authentication and authorization fundamentals.

## Scope

- Register
- Login
- JWT authentication
- Password hashing
- Role-based access

## Stack

- Node.js `24.14.1` Active LTS
- Express `5.2.1`
- jsonwebtoken `9.0.3`
- Core crypto: `randomBytes`, `scryptSync`, `timingSafeEqual`
- ESLint `10.1.0`
- c8 `11.0.0`
- Supertest `7.2.2`
- Docker Compose

## API

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `GET /admin`

Register and login request body:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Authenticated user response:

```json
{
  "id": 2,
  "email": "user@example.com",
  "role": "user"
}
```

Login response:

```json
{
  "token": "jwt"
}
```

The Docker runtime seeds one admin account:

- email: `admin@example.com`
- password: `admin-password`

## Local Run

```bash
docker compose up --build
```

The API listens on [http://localhost:3000](http://localhost:3000).

## Validation

```bash
make check
make docker-up
make request-smoke
make docker-test
make docker-down
```

`make check` runs lint, coverage, and `npm audit` on the host. `make docker-test` runs the containerized lint and coverage path.

## Example Requests

```bash
curl -X POST http://localhost:3000/auth/register -H 'Content-Type: application/json' -d '{"email":"user@example.com","password":"password123"}'
curl -X POST http://localhost:3000/auth/login -H 'Content-Type: application/json' -d '{"email":"user@example.com","password":"password123"}'
```
