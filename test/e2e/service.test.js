import test from 'node:test';
import assert from 'node:assert/strict';
import { startPlatform } from '../helpers/platform.js';

async function waitForProjection(baseUrl, path) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: { Connection: 'close' }
    });
    const projection = await response.json();

    if (projection.length === 1) {
      return projection;
    }

    await new Promise((resolve) => setTimeout(resolve, 25));
  }

  throw new Error(`Projection did not converge: ${path}`);
}

test('platform publishes events and converges projections over real http', async () => {
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
    const { eventId } = await response.json();

    const notifications = await waitForProjection(platform.api.url, '/notifications/user-1');
    const feed = await waitForProjection(platform.api.url, '/feed/user-1');
    const audit = await waitForProjection(platform.api.url, '/audit');

    assert.deepEqual(notifications, [{ eventId, message: 'created order', userId: 'user-1' }]);
    assert.deepEqual(feed, [{ eventId, message: 'created order', userId: 'user-1' }]);
    assert.deepEqual(audit, [{ eventId, message: 'created order', userId: 'user-1' }]);

    response = await fetch(`${platform.notificationsServer.url}/health`, {
      headers: { Connection: 'close' }
    });
    assert.equal(response.status, 200);

    response = await fetch(`${platform.feedServer.url}/health`, {
      headers: { Connection: 'close' }
    });
    assert.equal(response.status, 200);

    response = await fetch(`${platform.auditServer.url}/health`, {
      headers: { Connection: 'close' }
    });
    assert.equal(response.status, 200);
  } finally {
    await platform.close();
  }
});
