import assert from 'node:assert/strict';

const baseUrl = process.env.API_URL ?? 'http://localhost:3000';
const headers = {
  Authorization: `Bearer ${process.env.AUTH_TOKEN ?? 'platform-token'}`,
  'Content-Type': 'application/json'
};

let response = await fetch(`${baseUrl}/service-a/hello`, { headers });

assert.equal(response.status, 200);
assert.deepEqual(await response.json(), {
  body: null,
  method: 'GET',
  path: '/hello',
  service: 'service-a'
});

response = await fetch(`${baseUrl}/service-b/tasks`, {
  method: 'POST',
  headers,
  body: JSON.stringify({ task: 'sync' })
});

assert.equal(response.status, 200);
assert.deepEqual(await response.json(), {
  body: '{"task":"sync"}',
  method: 'POST',
  path: '/tasks',
  service: 'service-b'
});

response = await fetch(`${baseUrl}/service-a/hello`, { headers });

assert.equal(response.status, 429);
assert.deepEqual(await response.json(), { error: 'Rate limit exceeded' });
process.stdout.write('Gateway smoke passed\n');
