import { createServer } from 'node:http';
import { readPort, readServiceName } from './config.js';
import { createUpstreamHandler } from './upstream-handler.js';

const server = createServer(createUpstreamHandler(readServiceName()));

server.listen(readPort(), () => {
  process.stdout.write(`Listening on ${readPort()}\n`);
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
