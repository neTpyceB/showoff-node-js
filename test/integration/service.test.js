import test from 'node:test';
import assert from 'node:assert/strict';
import { createApiHandler } from '../../src/api-app.js';
import { createWorkerRuntime } from '../../src/worker-runtime.js';
import { createFakeStore } from '../helpers/fake-store.js';
import { request, startServer } from '../helpers/http.js';

test('api and workers build eventually consistent projections', async () => {
  const store = createFakeStore();
  const api = await startServer(createApiHandler({ store }));
  const notifications = createWorkerRuntime({
    consumerName: 'notifications-1',
    log: () => {},
    retryAfterMs: 0,
    serviceName: 'notifications',
    store
  });
  const feed = createWorkerRuntime({
    consumerName: 'feed-1',
    log: () => {},
    retryAfterMs: 0,
    serviceName: 'feed',
    store
  });
  const audit = createWorkerRuntime({
    consumerName: 'audit-1',
    log: () => {},
    retryAfterMs: 0,
    serviceName: 'audit',
    store
  });

  try {
    let response = await request(api.url, '/events', {
      body: '{"message":"created order","userId":"user-1"}',
      headers: { 'Content-Type': 'application/json' },
      method: 'POST'
    });

    assert.equal(response.status, 202);
    const { eventId } = JSON.parse(response.body);

    await notifications.tick();
    await feed.tick();
    await audit.tick();

    response = await request(api.url, '/notifications/user-1');
    assert.equal(response.status, 200);
    assert.equal(response.body, `[{"eventId":"${eventId}","message":"created order","userId":"user-1"}]`);

    response = await request(api.url, '/feed/user-1');
    assert.equal(response.status, 200);
    assert.equal(response.body, `[{"eventId":"${eventId}","message":"created order","userId":"user-1"}]`);

    response = await request(api.url, '/audit');
    assert.equal(response.status, 200);
    assert.equal(response.body, `[{"eventId":"${eventId}","message":"created order","userId":"user-1"}]`);
  } finally {
    await api.close();
  }
});
