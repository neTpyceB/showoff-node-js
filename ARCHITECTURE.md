# Architecture

## Shape

- `src/app.js`: Express app composition
- `src/server.js`: HTTP server entrypoint
- `src/auth/router.js`: register, login, and current-user routes
- `src/auth/store.js`: in-memory user storage
- `src/auth/password.js`: password hashing and verification
- `src/auth/tokens.js`: JWT issuing and verification
- `src/middleware/auth.js`: authentication and role checks
- `src/middleware/errors.js`: JSON error handling
- `src/middleware/logger.js`: request logging

## Runtime

- Users are stored in process memory because no database was required.
- Registration creates `user` accounts only.
- An admin account is seeded from environment variables at startup.
- Passwords are hashed with Node core `scrypt`.
- JWT bearer tokens carry `sub` and `role`.
- `/admin` is restricted to the `admin` role.

## Test Layers

- Unit: password hashing, token handling, store, validators, and middleware
- Integration: full app flows through Express
- E2E: spawned server process over real HTTP
- Smoke: startup plus minimal authenticated-surface readiness
