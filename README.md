# Simple REST API

Minimal Express.js CRUD backend built to practice clean API structure and middleware usage.

Storage is in-memory and scoped to the running process.

## Scope

- CRUD endpoints for `items`
- Request validation
- Error handling
- Basic request logging

## Stack

- Node.js `24.14.1` Active LTS
- Express `5.2.1`
- Pino `10.3.1`
- ESLint `10.1.0`
- c8 `11.0.0`
- Supertest `7.2.2`
- Docker Compose

## API

- `GET /items`
- `GET /items/:id`
- `POST /items`
- `PUT /items/:id`
- `DELETE /items/:id`

Request body for create and update:

```json
{
  "name": "Item name"
}
```

Successful item shape:

```json
{
  "id": 1,
  "name": "Item name"
}
```

Error response shape:

```json
{
  "error": "Message"
}
```

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

## Example Requests

```bash
curl http://localhost:3000/items
curl -X POST http://localhost:3000/items -H 'Content-Type: application/json' -d '{"name":"first"}'
curl http://localhost:3000/items/1
curl -X PUT http://localhost:3000/items/1 -H 'Content-Type: application/json' -d '{"name":"updated"}'
curl -X DELETE http://localhost:3000/items/1
```
