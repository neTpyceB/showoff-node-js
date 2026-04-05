import { sendJson } from './http.js';

export function createBalancerHandler({ backendUrls, fetchImpl = fetch, log, metrics }) {
  let nextIndex = 0;

  function nextBackendUrl() {
    const backendUrl = backendUrls[nextIndex % backendUrls.length];

    nextIndex += 1;
    return backendUrl;
  }

  return async (request, response) => {
    const url = new URL(request.url, 'http://localhost');

    if (request.method === 'GET' && url.pathname === '/metrics') {
      const backendMetrics = await Promise.all(
        backendUrls.map(async (backendUrl) => {
          const backendResponse = await fetchImpl(`${backendUrl}/metrics`);

          return backendResponse.json();
        })
      );

      sendJson(response, 200, {
        backends: backendMetrics,
        loadBalancer: metrics.snapshot()
      });
      return;
    }

    if (request.method === 'GET' && url.pathname === '/health') {
      try {
        const backendHealth = await Promise.all(
          backendUrls.map(async (backendUrl) => {
            const backendResponse = await fetchImpl(`${backendUrl}/health`);

            return backendResponse.json();
          })
        );
        sendJson(response, 200, { backends: backendHealth, status: 'ok' });
      } catch {
        metrics.recordError();
        sendJson(response, 503, { status: 'error' });
      }

      return;
    }

    if (request.method !== 'GET' || !url.pathname.startsWith('/records/')) {
      sendJson(response, 404, { error: 'Route not found' });
      return;
    }

    metrics.recordRequest();

    try {
      const backendUrl = nextBackendUrl();
      const upstream = await fetchImpl(`${backendUrl}${url.pathname}`);
      const body = await upstream.text();

      response.writeHead(upstream.status, { 'Content-Type': 'application/json' });
      response.end(body);
      log({ backendUrl, method: request.method, path: url.pathname, status: upstream.status });
    } catch {
      metrics.recordError();
      sendJson(response, 503, { error: 'Backend unavailable' });
      log({ method: request.method, path: url.pathname, status: 503 });
    }
  };
}
