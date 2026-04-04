# Security

- Passwords are hashed with `scrypt`.
- Bearer tokens are HMAC-signed.
- Auth verification is delegated to the auth service instead of duplicating token logic in the user service.
- No secrets are committed beyond local development defaults used in Docker.
