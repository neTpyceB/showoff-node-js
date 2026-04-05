# Security

- Redis is reachable only on the internal Docker network in the default stack.
- Public traffic goes through the API service only.
- Health endpoints expose only operational state required by the current scope.
- No application secrets are committed beyond local development defaults.
