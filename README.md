# CLI File Manager

Minimal Node.js CLI file manager built to practice core runtime APIs instead of web frameworks.

## Scope

- Navigate directories
- Read files
- Write files
- Search files by name
- Stream large files through Node streams

## Stack

- Node.js `24.14.1` Active LTS
- Core modules: `fs`, `stream`, `buffer`, `process`, `readline`
- ESLint `10.1.0`
- c8 `11.0.0`
- Docker Compose

## Commands

- `pwd`
- `ls`
- `cd <path>`
- `up`
- `read <path>`
- `write <path> <content>`
- `find <query> [path]`
- `stream <source> <destination>`

Use quotes when a path or content contains spaces.

## Local Run

```bash
docker compose run --rm app
```

The container starts in `/workspace`, which is the mounted project directory.

## Validation

```bash
make check
make docker-test
make docker-smoke
```

## Example Session

```text
pwd
ls
write "notes file.txt" "hello world"
read "notes file.txt"
find .txt
stream "notes file.txt" copy.txt
```
