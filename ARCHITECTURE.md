# Architecture

## Services

- Balancer service exposes the public HTTP surface and routes record requests in round-robin order.
- Backend service instances read and write records through shared Redis cache.
- Redis stores cached records shared by both backend instances.

## Flow

- Client calls balancer `GET /records/:id`.
- Balancer forwards the request to backend A or backend B.
- Backend checks Redis key `record:<id>`.
- Cache miss writes the generated record into Redis.
- Cache hit returns the shared cached record from Redis.

## Observability

- Balancer exposes aggregated metrics from itself and both backends.
- Each backend exposes its own metrics and health.
- Balancer and backends emit JSON-line logs.

## Runtime

- One shared Node image
- One balancer container
- Two backend containers
- One Redis container
- One test container
