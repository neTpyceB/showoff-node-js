import test from 'node:test';
import assert from 'node:assert/strict';
import { createUpstreamHandler } from '../../src/upstream-handler.js';
import { request, startServer } from '../helpers/http.js';

test('upstream handler returns service metadata and request body', async () => {
  const server = await startServer(createUpstreamHandler('service-a'));

  try {
    let response = await request(server.url, '/hello');

    assert.equal(response.status, 200);
    assert.equal(response.body, '{"body":null,"method":"GET","path":"/hello","service":"service-a"}');

    response = await request(server.url, '/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"task":"sync"}'
    });

    assert.equal(response.status, 200);
    assert.equal(
      response.body,
      '{"body":"{\\"task\\":\\"sync\\"}","method":"POST","path":"/tasks","service":"service-a"}'
    );

    response = await request(server.url, '/empty', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: ''
    });

    assert.equal(response.status, 200);
    assert.equal(response.body, '{"body":null,"method":"POST","path":"/empty","service":"service-a"}');
  } finally {
    await server.close();
  }
});
