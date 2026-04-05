import { createServer } from 'node:http';
import { readBackendUrls, readInstanceId, readPort, readRedisUrl, readServiceName } from './config.js';
import { createRuntimeHandler } from './runtime.js';

const serviceName = readServiceName();
const port = readPort();
const handler = await createRuntimeHandler({
  backendUrls: readBackendUrls(),
  instanceId: readInstanceId(),
  redisUrl: readRedisUrl(),
  serviceName
});

const server = createServer(handler);

server.listen(port, () => {
  process.stdout.write(`Listening on ${serviceName} ${port}\n`);
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
