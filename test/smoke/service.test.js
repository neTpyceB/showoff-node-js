import test from 'node:test';
import assert from 'node:assert/strict';
import { startPlatform } from '../helpers/platform.js';

test('process runtime supports event publishing and health', async () => {
  const platform = await startPlatform();

  try {
    let response = await fetch(`${platform.api.url}/events`, {
      body: '{"message":"created order","userId":"user-1"}',
      headers: {
        Connection: 'close',
        'Content-Type': 'application/json'
      },
      method: 'POST'
    });

    assert.equal(response.status, 202);

    response = await fetch(`${platform.api.url}/health`, {
      headers: { Connection: 'close' }
    });

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: 'ok' });
  } finally {
    await platform.close();
  }
});
