import { createServer } from 'node:http';
import { createHandler } from './app.js';

const port = Number.parseInt(process.env.PORT ?? '3000', 10);

createServer(createHandler()).listen(port, () => {
  process.stdout.write(`Listening on ${port}\n`);
});
