import test from 'node:test';
import assert from 'node:assert/strict';
import { createApiHandler } from '../../src/api-app.js';
import { createFakeStore } from '../helpers/fake-store.js';
import { request, startServer } from '../helpers/http.js';

test('api publishes events and serves projections and health', async () => {
  const store = createFakeStore();

  await store.appendList('notifications:user-1', '{"eventId":"1","message":"created order","userId":"user-1"}');
  await store.appendList('feed:user-1', '{"eventId":"1","message":"created order","userId":"user-1"}');
  await store.appendList('audit', '{"eventId":"1","message":"created order","userId":"user-1"}');

  const server = await startServer(createApiHandler({ store }));

  try {
    let response = await request(server.url, '/events', {
      body: '{"message":"created order","userId":"user-1"}',
      headers: { 'Content-Type': 'application/json' },
      method: 'POST'
    });

    assert.equal(response.status, 202);
    assert.equal(typeof JSON.parse(response.body).eventId, 'string');

    response = await request(server.url, '/notifications/user-1');
    assert.equal(response.status, 200);
    assert.equal(response.body, '[{"eventId":"1","message":"created order","userId":"user-1"}]');

    response = await request(server.url, '/feed/user-1');
    assert.equal(response.status, 200);
    assert.equal(response.body, '[{"eventId":"1","message":"created order","userId":"user-1"}]');

    response = await request(server.url, '/audit');
    assert.equal(response.status, 200);
    assert.equal(response.body, '[{"eventId":"1","message":"created order","userId":"user-1"}]');

    response = await request(server.url, '/health');
    assert.equal(response.status, 200);
    assert.equal(response.body, '{"status":"ok"}');
  } finally {
    await server.close();
  }
});

test('api returns json, route, and store errors', async () => {
  let server = await startServer(createApiHandler({ store: createFakeStore() }));

  try {
    let response = await request(server.url, '/events', {
      body: '{',
      headers: { 'Content-Type': 'application/json' },
      method: 'POST'
    });

    assert.equal(response.status, 400);
    assert.equal(response.body, '{"error":"Invalid JSON"}');

    response = await request(server.url, '/missing');
    assert.equal(response.status, 404);
    assert.equal(response.body, '{"error":"Route not found"}');
  } finally {
    await server.close();
  }

  server = await startServer(
    createApiHandler({
      store: {
        async addEvent() {
          throw new Error('redis unavailable');
        },
        async ping() {
          throw new Error('redis unavailable');
        },
        async readList() {
          throw new Error('redis unavailable');
        }
      }
    })
  );

  try {
    let response = await request(server.url, '/events', {
      body: '{"message":"created order","userId":"user-1"}',
      headers: { 'Content-Type': 'application/json' },
      method: 'POST'
    });

    assert.equal(response.status, 503);
    assert.equal(response.body, '{"error":"Store unavailable"}');

    response = await request(server.url, '/health');
    assert.equal(response.status, 503);
    assert.equal(response.body, '{"error":"Store unavailable"}');
  } finally {
    await server.close();
  }
});
