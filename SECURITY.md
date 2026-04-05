# Security

- Redis is reachable only on the internal Docker network in the default stack.
- Public traffic goes through the balancer only.
- Health and metrics endpoints expose only operational state required by the current scope.
- No application secrets are committed beyond local development defaults.
