import test from 'node:test';
import assert from 'node:assert/strict';
import { createHandler } from '../../src/app.js';
import { request, startServer } from '../helpers/http.js';

test('api enqueues jobs and reads status over http', async () => {
  const jobs = new Map();
  let nextId = 0;
  const server = await startServer(
    createHandler({
      async enqueueJob(payload) {
        const id = String(++nextId);

        jobs.set(id, {
          id,
          state: payload.delayMs > 0 ? 'delayed' : 'waiting',
          attemptsMade: payload.failUntilAttempt,
          result: { output: payload.value.toUpperCase() },
          failedReason: null
        });

        return { id };
      },
      async getJob(id) {
        return jobs.get(id) ?? null;
      }
    })
  );

  try {
    let response = await request(server.url, '/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: 'hello', delayMs: 250, failUntilAttempt: 1 })
    });

    assert.equal(response.status, 201);
    assert.equal(response.body, '{"id":"1"}');

    response = await request(server.url, '/jobs/1');

    assert.equal(response.status, 200);
    assert.equal(
      response.body,
      '{"id":"1","state":"delayed","attemptsMade":1,"result":{"output":"HELLO"},"failedReason":null}'
    );
  } finally {
    await server.close();
  }
});

test('api returns errors for invalid json, missing jobs, and missing routes', async () => {
  const server = await startServer(
    createHandler({
      async enqueueJob() {
        return { id: '1' };
      },
      async getJob() {
        return null;
      }
    })
  );

  try {
    let response = await request(server.url, '/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{'
    });

    assert.equal(response.status, 400);
    assert.equal(response.body, '{"error":"Invalid JSON"}');

    response = await request(server.url, '/jobs/missing');

    assert.equal(response.status, 404);
    assert.equal(response.body, '{"error":"Job not found"}');

    response = await request(server.url, '/missing');

    assert.equal(response.status, 404);
    assert.equal(response.body, '{"error":"Route not found"}');
  } finally {
    await server.close();
  }
});
