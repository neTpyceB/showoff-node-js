import { sendJson } from './http.js';

function readRecordId(pathname) {
  const match = pathname.match(/^\/records\/([^/]+)$/);

  return match?.[1] ?? null;
}

export function createBackendHandler({ cache, instanceId, log, metrics, ttlSeconds = 60 }) {
  return async (request, response) => {
    const url = new URL(request.url, 'http://localhost');

    if (request.method === 'GET' && url.pathname === '/metrics') {
      sendJson(response, 200, { instanceId, ...metrics.snapshot() });
      return;
    }

    if (request.method === 'GET' && url.pathname === '/health') {
      try {
        await cache.ping();
        sendJson(response, 200, { instanceId, redis: 'ok', status: 'ok' });
      } catch {
        sendJson(response, 503, { instanceId, redis: 'error', status: 'error' });
      }

      return;
    }

    if (request.method !== 'GET') {
      sendJson(response, 404, { error: 'Route not found' });
      return;
    }

    const id = readRecordId(url.pathname);

    if (!id) {
      sendJson(response, 404, { error: 'Route not found' });
      return;
    }

    metrics.recordRequest();

    try {
      const key = `record:${id}`;
      const cached = await cache.get(key);

      if (cached) {
        metrics.recordCacheHit();
        sendJson(response, 200, { cached: true, id, instanceId, value: JSON.parse(cached).value });
        log({ cache: 'hit', instanceId, method: request.method, path: url.pathname, status: 200 });
        return;
      }

      metrics.recordCacheMiss();
      const record = { value: `value-${id}` };
      await cache.set(key, JSON.stringify(record), ttlSeconds);
      sendJson(response, 200, { cached: false, id, instanceId, value: record.value });
      log({ cache: 'miss', instanceId, method: request.method, path: url.pathname, status: 200 });
    } catch {
      metrics.recordError();
      sendJson(response, 503, { error: 'Cache unavailable' });
      log({ instanceId, method: request.method, path: url.pathname, status: 503 });
    }
  };
}
