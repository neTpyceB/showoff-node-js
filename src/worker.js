import { readQueueName, readRedisUrl } from './config.js';
import { createWorkerRuntime } from './runtime.js';

const runtime = createWorkerRuntime({
  queueName: readQueueName(),
  redisUrl: readRedisUrl()
});

process.stdout.write(`Worker started for ${readQueueName()}\n`);

async function shutdown() {
  await runtime.close();
  process.exit(0);
}

process.on('SIGINT', () => {
  void shutdown();
});
process.on('SIGTERM', () => {
  void shutdown();
});
