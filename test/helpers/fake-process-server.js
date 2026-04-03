import { createServer } from 'node:http';
import { createHandler } from '../../src/app.js';

let nextId = 0;
const jobs = new Map();

const jobService = {
  async enqueueJob(payload) {
    const id = String(++nextId);
    const job = {
      id,
      state: 'completed',
      attemptsMade: payload.failUntilAttempt,
      failedReason: null,
      result: { output: payload.value.toUpperCase() }
    };

    jobs.set(id, job);
    return { id };
  },
  async getJob(id) {
    return jobs.get(id) ?? null;
  }
};

const server = createServer(createHandler(jobService));

server.listen(Number.parseInt(process.env.PORT ?? '3000', 10), '127.0.0.1', () => {
  process.stdout.write('ready\n');
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
