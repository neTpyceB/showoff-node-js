import { createServer } from 'node:http';
import { createHandler } from './app.js';
import { readPort, readQueueName, readRedisUrl } from './config.js';
import { createQueueRuntime } from './runtime.js';

const runtime = createQueueRuntime({
  queueName: readQueueName(),
  redisUrl: readRedisUrl()
});
const server = createServer(createHandler(runtime.jobService));

server.listen(readPort(), () => {
  process.stdout.write(`Listening on ${readPort()}\n`);
});

async function shutdown() {
  await new Promise((resolve) => server.close(resolve));
  await runtime.close();
  process.exit(0);
}

process.on('SIGINT', () => {
  void shutdown();
});
process.on('SIGTERM', () => {
  void shutdown();
});
