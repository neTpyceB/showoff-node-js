# Architecture

## Services

- Auth service stores users in memory, hashes passwords, issues signed bearer tokens, and verifies them.
- User service accepts client requests, validates bearer tokens through the auth service, and calls the payment service for payment creation.
- Payment service returns approved mock payments and stores them in memory.

## Communication

- Client registers and logs in against auth.
- Client calls user with `Authorization: Bearer <token>`.
- User calls auth `GET /verify`.
- User calls payment `POST /payments`.

## Runtime

- One shared Node image
- Three service containers
- One test container
- Health checks on each service
