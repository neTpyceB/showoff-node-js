import test from 'node:test';
import assert from 'node:assert/strict';
import { createHandler } from '../../src/app.js';
import { request, startServer } from '../helpers/http.js';

test('handler creates a job and returns its id', async () => {
  const payloads = [];
  const server = await startServer(
    createHandler({
      async enqueueJob(payload) {
        payloads.push(payload);
        return { id: '1' };
      },
      async getJob() {
        return null;
      }
    })
  );

  try {
    const response = await request(server.url, '/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: 'hello', delayMs: 0, failUntilAttempt: 0 })
    });

    assert.equal(response.status, 201);
    assert.equal(response.body, '{"id":"1"}');
    assert.deepEqual(payloads, [{ value: 'hello', delayMs: 0, failUntilAttempt: 0 }]);
  } finally {
    await server.close();
  }
});

test('handler returns job details, route not found, invalid json, and internal errors', async () => {
  const server = await startServer(
    createHandler({
      async enqueueJob() {
        throw new Error('boom');
      },
      async getJob(id) {
        if (id === '1') {
          return {
            id: '1',
            state: 'completed',
            attemptsMade: 1,
            result: { output: 'HELLO' },
            failedReason: null
          };
        }

        return null;
      }
    })
  );

  try {
    let response = await request(server.url, '/jobs/1');

    assert.equal(response.status, 200);
    assert.equal(
      response.body,
      '{"id":"1","state":"completed","attemptsMade":1,"result":{"output":"HELLO"},"failedReason":null}'
    );

    response = await request(server.url, '/jobs/missing');

    assert.equal(response.status, 404);
    assert.equal(response.body, '{"error":"Job not found"}');

    response = await request(server.url, '/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{'
    });

    assert.equal(response.status, 400);
    assert.equal(response.body, '{"error":"Invalid JSON"}');

    response = await request(server.url, '/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: 'hello', delayMs: 0, failUntilAttempt: 0 })
    });

    assert.equal(response.status, 500);
    assert.equal(response.body, '{"error":"Internal server error"}');

    response = await request(server.url, '/missing');

    assert.equal(response.status, 404);
    assert.equal(response.body, '{"error":"Route not found"}');
  } finally {
    await server.close();
  }
});
