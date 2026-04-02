import test from 'node:test';
import assert from 'node:assert/strict';
import { createHandler } from '../../src/app.js';
import { request, startServer } from '../helpers/http.js';

test('csv-to-ndjson endpoint transforms streamed csv input', async () => {
  const server = await startServer(createHandler());

  try {
    const response = await request(server.url, '/transform/csv-to-ndjson', {
      method: 'POST',
      headers: { 'Content-Type': 'text/csv' },
      body: 'name,score\nalice,10\nbob,20\n'
    });

    assert.equal(response.status, 200);
    assert.equal(response.body, '{"name":"alice","score":"10"}\n{"name":"bob","score":"20"}\n');
  } finally {
    await server.close();
  }
});

test('json-to-csv endpoint transforms streamed json input', async () => {
  const server = await startServer(createHandler());

  try {
    const response = await request(server.url, '/transform/json-to-csv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '[{"name":"alice","score":10},{"name":"bob","score":20}]'
    });

    assert.equal(response.status, 200);
    assert.equal(response.body, 'name,score\nalice,10\nbob,20\n');
  } finally {
    await server.close();
  }
});

test('csv-to-ndjson returns an empty successful response when only headers are provided', async () => {
  const server = await startServer(createHandler());

  try {
    const response = await request(server.url, '/transform/csv-to-ndjson', {
      method: 'POST',
      headers: { 'Content-Type': 'text/csv' },
      body: 'name,score\n'
    });

    assert.equal(response.status, 200);
    assert.equal(response.body, '');
  } finally {
    await server.close();
  }
});

test('service returns json errors for invalid input and missing routes', async () => {
  const server = await startServer(createHandler());

  try {
    let response = await request(server.url, '/transform/csv-to-ndjson', {
      method: 'POST',
      headers: { 'Content-Type': 'text/csv' },
      body: 'name,score\nalice\n'
    });

    assert.equal(response.status, 400);
    assert.equal(response.body, '{"error":"Invalid CSV"}');

    response = await request(server.url, '/transform/json-to-csv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"name":"alice"}'
    });

    assert.equal(response.status, 400);
    assert.equal(response.body, '{"error":"Invalid JSON"}');

    response = await request(server.url, '/missing', {
      method: 'POST',
      body: ''
    });

    assert.equal(response.status, 404);
    assert.equal(response.body, '{"error":"Route not found"}');
  } finally {
    await server.close();
  }
});

test('service stops exporting when a stream fails after output has started', async () => {
  const server = await startServer(createHandler());

  try {
    const response = await request(server.url, '/transform/csv-to-ndjson', {
      method: 'POST',
      headers: { 'Content-Type': 'text/csv' },
      body: 'name,score\nalice,10\nbob\n'
    });

    assert.equal(response.status, 200);
    assert.equal(response.body, '{"name":"alice","score":"10"}\n');
  } finally {
    await server.close();
  }
});
