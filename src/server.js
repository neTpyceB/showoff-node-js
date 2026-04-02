import { pathToFileURL } from 'node:url';
import { createApp } from './app.js';

export function readPort(env = process.env) {
  return Number.parseInt(env.PORT ?? '3000', 10);
}

export function readDatabasePath(env = process.env) {
  return env.DATABASE_PATH ?? 'tmp/chat.sqlite';
}

export function shutdownApp(app, exit, exitCode) {
  return app.close().then(
    () => exit(exitCode),
    () => exit(1)
  );
}

export function startServer(env = process.env) {
  const port = readPort(env);
  const app = createApp({ databasePath: readDatabasePath(env) });

  app.server.listen(port, () => {
    process.stdout.write(`Listening on ${port}\n`);
  });

  process.on('SIGINT', () => {
    void shutdownApp(app, process.exit, 0);
  });
  process.on('SIGTERM', () => {
    void shutdownApp(app, process.exit, 0);
  });

  return app;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startServer();
}
