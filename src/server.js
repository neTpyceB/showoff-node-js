import { createServer } from 'node:http';
import { createGatewayHandler } from './app.js';
import { readAuthToken, readPort, readRateLimitLimit, readRateLimitWindowMs, readRoutes } from './config.js';
import { createLogger } from './logger.js';
import { createRateLimiter } from './rate-limit.js';

const server = createServer(
  createGatewayHandler({
    authToken: readAuthToken(),
    limiter: createRateLimiter({
      limit: readRateLimitLimit(),
      windowMs: readRateLimitWindowMs()
    }),
    log: createLogger(),
    routes: readRoutes()
  })
);

server.listen(readPort(), () => {
  process.stdout.write(`Listening on ${readPort()}\n`);
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
