# Data Processing Service

Minimal Node.js streaming service built to process large CSV and JSON files without loading them into memory.

## Scope

- Process large CSV files
- Process large JSON files
- Transform data streams
- Export transformed results

## Stack

- Node.js `24.14.1` Active LTS
- Core modules: `http`, `stream`, `stream/promises`
- csv-parse `6.2.1`
- csv-stringify `6.7.0`
- stream-json `2.1.0`
- ESLint `10.1.0`
- c8 `11.0.0`
- Docker Compose

## API

- `POST /transform/csv-to-ndjson`
- `POST /transform/json-to-csv`

`POST /transform/csv-to-ndjson`

Input:

```csv
name,score
alice,10
bob,20
```

Output:

```json
{"name":"alice","score":"10"}
{"name":"bob","score":"20"}
```

`POST /transform/json-to-csv`

Input:

```json
[
  { "name": "alice", "score": 10 },
  { "name": "bob", "score": 20 }
]
```

Output:

```csv
name,score
alice,10
bob,20
```

Errors are returned as:

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

`make check` runs lint, coverage, and `npm audit` on the host. `make docker-test` runs the containerized lint and coverage path.

## Example Requests

```bash
curl -X POST http://localhost:3000/transform/csv-to-ndjson \
  -H 'Content-Type: text/csv' \
  --data-binary $'name,score\nalice,10\nbob,20\n'

curl -X POST http://localhost:3000/transform/json-to-csv \
  -H 'Content-Type: application/json' \
  --data-binary '[{"name":"alice","score":10},{"name":"bob","score":20}]'
```
