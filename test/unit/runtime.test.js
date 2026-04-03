import test from 'node:test';
import assert from 'node:assert/strict';
import { createQueueRuntime, createRedisConnection, createWorkerRuntime } from '../../src/runtime.js';

test('runtime creates redis connections with the expected options', () => {
  const calls = [];

  class FakeRedis {
    constructor(url, options) {
      calls.push({ url, options });
    }
  }

  createRedisConnection('redis://queue:6379', FakeRedis);

  assert.deepEqual(calls, [
    {
      url: 'redis://queue:6379',
      options: { maxRetriesPerRequest: null }
    }
  ]);
});

test('queue runtime creates the queue-backed job service and closes resources', async () => {
  const calls = [];

  class FakeRedis {
    constructor(url) {
      this.url = url;
    }

    async quit() {
      calls.push({ type: 'quit', url: this.url });
    }
  }

  class FakeQueue {
    constructor(name, options) {
      calls.push({ type: 'queue', name, options });
    }

    async add(name, payload, options) {
      calls.push({ type: 'add', name, payload, options });
      return { id: 9 };
    }

    async close() {
      calls.push({ type: 'queue-close' });
    }
  }

  const runtime = createQueueRuntime(
    { queueName: 'jobs', redisUrl: 'redis://queue:6379' },
    {
      RedisClass: FakeRedis,
      QueueClass: FakeQueue,
      findJob: async (_queue, id) => ({
        id,
        attemptsMade: 0,
        failedReason: 'failed',
        returnvalue: null,
        async getState() {
          return 'failed';
        }
      })
    }
  );

  assert.deepEqual(
    await runtime.jobService.enqueueJob({ value: 'hello', delayMs: 100, failUntilAttempt: 1 }),
    { id: '9' }
  );
  assert.deepEqual(await runtime.jobService.getJob('11'), {
    id: '11',
    state: 'failed',
    attemptsMade: 0,
    result: null,
    failedReason: 'failed'
  });

  await runtime.close();

  assert.deepEqual(calls, [
    {
      type: 'queue',
      name: 'jobs',
      options: { connection: new FakeRedis('redis://queue:6379') }
    },
    {
      type: 'add',
      name: 'job',
      payload: { value: 'hello', delayMs: 100, failUntilAttempt: 1 },
      options: { attempts: 2, delay: 100 }
    },
    { type: 'queue-close' },
    { type: 'quit', url: 'redis://queue:6379' }
  ]);
});

test('worker runtime creates a worker, delegates processing, and closes resources', async () => {
  const calls = [];

  class FakeRedis {
    constructor(url) {
      this.url = url;
    }

    async quit() {
      calls.push({ type: 'quit', url: this.url });
    }
  }

  class FakeWorker {
    constructor(name, processor, options) {
      this.name = name;
      this.processor = processor;
      calls.push({ type: 'worker', name, options });
    }

    async close() {
      calls.push({ type: 'worker-close' });
    }
  }

  const runtime = createWorkerRuntime(
    { queueName: 'jobs', redisUrl: 'redis://queue:6379' },
    {
      RedisClass: FakeRedis,
      WorkerClass: FakeWorker,
      processor: (payload, attemptsMade) => {
        calls.push({ type: 'process', payload, attemptsMade });
        return { output: payload.value.toUpperCase() };
      }
    }
  );

  assert.deepEqual(
    await runtime.worker.processor({ data: { value: 'hello' }, attemptsMade: 2 }),
    { output: 'HELLO' }
  );

  await runtime.close();

  assert.deepEqual(calls, [
    {
      type: 'worker',
      name: 'jobs',
      options: { connection: new FakeRedis('redis://queue:6379') }
    },
    {
      type: 'process',
      payload: { value: 'hello' },
      attemptsMade: 2
    },
    { type: 'worker-close' },
    { type: 'quit', url: 'redis://queue:6379' }
  ]);
});
