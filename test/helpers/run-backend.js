import { createServer } from 'node:http';
import { createBackendHandler } from '../../src/backend-app.js';
import { createMetrics } from '../../src/metrics.js';

const store = globalThis.__store ?? new Map();
globalThis.__store = store;

const cache = {
  async get(key) {
    return store.get(key) ?? null;
  },
  async ping() {
    return 'PONG';
  },
  async set(key, value) {
    store.set(key, value);
  }
};

const server = createServer(
  createBackendHandler({
    cache,
    instanceId: process.env.INSTANCE_ID ?? 'backend-a',
    log: () => {},
    metrics: createMetrics()
  })
);

server.listen(Number(process.env.PORT), '127.0.0.1');

function shutdown() {
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
