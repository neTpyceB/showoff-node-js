import { randomUUID } from 'node:crypto';
import { readJsonBody, sendJson } from './http.js';
import { listKey } from './projection.js';

function readUserId(pathname, resource) {
  const match = pathname.match(new RegExp(`^/${resource}/([^/]+)$`));

  return match?.[1] ?? null;
}

async function readProjection(store, key) {
  return (await store.readList(key)).map((entry) => JSON.parse(entry));
}

export function createApiHandler({ store }) {
  return async (request, response) => {
    const url = new URL(request.url, 'http://localhost');

    try {
      if (request.method === 'POST' && url.pathname === '/events') {
        const payload = await readJsonBody(request);
        const eventId = randomUUID();

        await store.addEvent({
          eventId,
          message: payload.message,
          userId: payload.userId
        });
        sendJson(response, 202, { eventId });
        return;
      }

      if (request.method === 'GET' && url.pathname === '/audit') {
        sendJson(response, 200, await readProjection(store, 'audit'));
        return;
      }

      if (request.method === 'GET' && url.pathname === '/health') {
        await store.ping();
        sendJson(response, 200, { status: 'ok' });
        return;
      }

      if (request.method === 'GET') {
        const notificationsUserId = readUserId(url.pathname, 'notifications');

        if (notificationsUserId) {
          sendJson(response, 200, await readProjection(store, listKey('notifications', notificationsUserId)));
          return;
        }

        const feedUserId = readUserId(url.pathname, 'feed');

        if (feedUserId) {
          sendJson(response, 200, await readProjection(store, listKey('feed', feedUserId)));
          return;
        }
      }

      sendJson(response, 404, { error: 'Route not found' });
    } catch (error) {
      if (error instanceof SyntaxError) {
        sendJson(response, 400, { error: 'Invalid JSON' });
        return;
      }

      sendJson(response, 503, { error: 'Store unavailable' });
    }
  };
}
