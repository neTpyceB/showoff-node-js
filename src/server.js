import { createServer } from 'node:http';
import {
  readAuthSecret,
  readAuthServiceUrl,
  readPaymentServiceUrl,
  readPort,
  readServiceName
} from './config.js';
import { createServiceHandler } from './service-factory.js';

const serviceName = readServiceName();
const port = readPort();
const server = createServer(
  createServiceHandler({
    authSecret: readAuthSecret(),
    authServiceUrl: readAuthServiceUrl(),
    paymentServiceUrl: readPaymentServiceUrl(),
    serviceName
  })
);

server.listen(port, () => {
  process.stdout.write(`Listening on ${serviceName} ${port}\n`);
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
