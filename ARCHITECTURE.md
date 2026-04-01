# Architecture

## Shape

- `src/file-manager.js`: filesystem state and core operations
- `src/command.js`: command parsing and dispatch
- `src/cli.js`: stdin-driven runtime loop

## Runtime

- `FileManager` owns the current working directory.
- Commands resolve against that directory.
- File writes use `Buffer.from(...)`.
- Large file copying uses `pipeline(...)` with a counting `Transform`.
- CLI input is processed line by line from `process.stdin`.

## Test Layers

- Unit: command parsing and dispatch
- Integration: filesystem behavior against temp directories
- E2E: spawned CLI process over real stdin/stdout
- Smoke: minimal startup and command execution path
