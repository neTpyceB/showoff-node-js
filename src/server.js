import { createServer } from 'node:http';
import { readConsumerName, readPort, readRedisUrl, readRetryAfterMs, readServiceName } from './config.js';
import { createRuntime } from './runtime.js';

const serviceName = readServiceName();
const port = readPort();
const runtime = await createRuntime({
  consumerName: readConsumerName(),
  redisUrl: readRedisUrl(),
  retryAfterMs: readRetryAfterMs(),
  serviceName
});
const stopWorker = runtime.start?.() ?? (() => {});

const server = createServer(runtime.handler);

server.listen(port, () => {
  process.stdout.write(`Listening on ${serviceName} ${port}\n`);
});

function shutdown() {
  stopWorker();
  server.close(async () => {
    await runtime.stop?.();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
