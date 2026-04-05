import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorkerRuntime } from '../../src/worker-runtime.js';
import { createFakeStore } from '../helpers/fake-store.js';
import { request, startServer } from '../helpers/http.js';

test('worker runtime exposes health and processes events', async () => {
  const logs = [];
  const store = createFakeStore();

  await store.addEvent({ eventId: '1', message: 'created order', userId: 'user-1' });

  const worker = createWorkerRuntime({
    consumerName: 'worker-1',
    log: (entry) => logs.push(entry),
    retryAfterMs: 0,
    serviceName: 'notifications',
    store
  });
  const server = await startServer(worker.handler);

  try {
    await worker.tick();

    let response = await request(server.url, '/health');

    assert.equal(response.status, 200);
    assert.equal(response.body, '{"service":"notifications","status":"ok"}');

    response = await request(server.url, '/missing');

    assert.equal(response.status, 404);
    assert.equal(response.body, '{"error":"Route not found"}');

    assert.deepEqual(await store.readList('notifications:user-1'), [
      '{"eventId":"1","message":"created order","userId":"user-1"}'
    ]);
    assert.deepEqual(logs, [
      { eventId: '1', service: 'notifications', status: 'processed' }
    ]);
  } finally {
    await server.close();
  }
});

test('worker runtime retries pending events after failure', async () => {
  const logs = [];
  const store = createFakeStore();
  let failed = false;

  await store.addEvent({ eventId: '1', message: 'created order', userId: 'user-1' });

  const worker = createWorkerRuntime({
    consumerName: 'worker-1',
    log: (entry) => logs.push(entry),
    retryAfterMs: 0,
    serviceName: 'feed',
    store: {
      ...store,
      async appendList(key, value) {
        if (!failed) {
          failed = true;
          throw new Error('write failed');
        }

        await store.appendList(key, value);
      }
    }
  });

  await worker.tick();
  await worker.tick();

  assert.deepEqual(await store.readList('feed:user-1'), [
    '{"eventId":"1","message":"created order","userId":"user-1"}'
  ]);
  assert.deepEqual(logs, [
    { eventId: '1', service: 'feed', status: 'failed' },
    { eventId: '1', service: 'feed', status: 'processed' }
  ]);
});

test('worker runtime starts and stops its polling loop', async () => {
  let ticks = 0;
  let release;
  const worker = createWorkerRuntime({
    consumerName: 'worker-1',
    log: () => {},
    pollMs: 0,
    retryAfterMs: 0,
    serviceName: 'audit',
    store: {
      async ack() {},
      async appendList() {},
      async claimPending() {
        return [];
      },
      async ensureGroup() {
        ticks += 1;
        await new Promise((resolve) => {
          release = resolve;
        });
      },
      async ping() {
        return 'PONG';
      },
      async readNew() {
        return [];
      }
    }
  });

  const stop = worker.start();
  const secondStop = worker.start();
  stop();
  release();
  await new Promise((resolve) => setTimeout(resolve, 10));
  secondStop();
  worker.stop();

  assert.ok(ticks >= 1);
});
