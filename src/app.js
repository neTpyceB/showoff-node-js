import { isAuthorized, readBearerToken } from './auth.js';
import { matchRoute, toUpstreamUrl } from './router.js';

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(payload));
}

async function readJsonBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  return JSON.parse(Buffer.concat(chunks).toString());
}

export function createGatewayHandler({
  authToken,
  fetchImpl = fetch,
  limiter,
  log,
  routes
}) {
  return async (request, response) => {
    const url = new URL(request.url, 'http://localhost');
    const route = matchRoute(url.pathname, routes);

    if (!route) {
      sendJson(response, 404, { error: 'Route not found' });
      log({ method: request.method, path: url.pathname, service: null, status: 404 });
      return;
    }

    if (!isAuthorized(request.headers.authorization, authToken)) {
      sendJson(response, 401, { error: 'Unauthorized' });
      log({ method: request.method, path: url.pathname, service: route.service, status: 401 });
      return;
    }

    const key = `${request.socket.remoteAddress}:${readBearerToken(request.headers.authorization)}`;
    const rateLimit = limiter.check(key);

    if (!rateLimit.allowed) {
      sendJson(response, 429, { error: 'Rate limit exceeded' });
      log({ method: request.method, path: url.pathname, service: route.service, status: 429 });
      return;
    }

    try {
      const body =
        request.method === 'GET' || request.method === 'HEAD'
          ? undefined
          : await readJsonBody(request).then((payload) => JSON.stringify(payload));
      const upstream = await fetchImpl(toUpstreamUrl(route, url), {
        body,
        headers: request.headers['content-type']
          ? { 'Content-Type': request.headers['content-type'] }
          : undefined,
        method: request.method
      });
      const responseBody = await upstream.text();

      response.writeHead(upstream.status, {
        'Content-Type': 'application/json'
      });
      response.end(responseBody);
      log({ method: request.method, path: url.pathname, service: route.service, status: upstream.status });
    } catch (error) {
      if (error instanceof SyntaxError) {
        sendJson(response, 400, { error: 'Invalid JSON' });
        log({ method: request.method, path: url.pathname, service: route.service, status: 400 });
        return;
      }

      sendJson(response, 502, { error: 'Upstream request failed' });
      log({ method: request.method, path: url.pathname, service: route.service, status: 502 });
    }
  };
}
