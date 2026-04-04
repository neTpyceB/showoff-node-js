# Architecture

## Shape

- `src/app.js`: gateway proxy handler
- `src/auth.js`: bearer-token parsing and auth check
- `src/config.js`: env-based runtime configuration
- `src/logger.js`: structured request logging
- `src/rate-limit.js`: fixed-window limiter
- `src/router.js`: route matching and upstream URL construction
- `src/server.js`: gateway process entrypoint
- `src/upstream-handler.js`: minimal upstream service behavior
- `src/upstream-server.js`: upstream service process entrypoint

## Runtime

- The gateway matches incoming paths by prefix and forwards them to upstream services.
- The auth layer requires a configured bearer token before proxying any routed request.
- The rate limiter runs in the gateway before upstream calls.
- The gateway logs method, path, upstream service, and final status as JSON lines.
- Upstream services are minimal HTTP servers used to verify routing behavior.

## Test Layers

- Unit: auth, config, logger, limiter, router, upstream handler, and gateway behavior
- Integration: gateway plus in-process upstream services
- E2E: spawned gateway and upstream processes over real HTTP
- Smoke: startup plus authenticated routing and rate limiting
