import { readBearerToken } from './auth.js';
import { readJsonBody, sendJson } from './http.js';

async function verifyIdentity(authServiceUrl, authorization, fetchImpl) {
  if (!readBearerToken(authorization)) {
    return null;
  }

  const response = await fetchImpl(`${authServiceUrl}/verify`, {
    headers: { Authorization: authorization }
  });

  if (response.status === 401) {
    return null;
  }

  return response.json();
}

export function createUserHandler({
  authServiceUrl,
  fetchImpl = fetch,
  paymentServiceUrl
}) {
  return async (request, response) => {
    const url = new URL(request.url, 'http://localhost');

    try {
      if (request.method === 'GET' && url.pathname === '/users/me') {
        const user = await verifyIdentity(authServiceUrl, request.headers.authorization, fetchImpl);

        if (!user) {
          sendJson(response, 401, { error: 'Unauthorized' });
          return;
        }

        sendJson(response, 200, user);
        return;
      }

      if (request.method === 'POST' && url.pathname === '/users/me/payments') {
        const user = await verifyIdentity(authServiceUrl, request.headers.authorization, fetchImpl);

        if (!user) {
          sendJson(response, 401, { error: 'Unauthorized' });
          return;
        }

        const payload = await readJsonBody(request);
        const payment = await fetchImpl(`${paymentServiceUrl}/payments`, {
          body: JSON.stringify({ amount: payload.amount, userId: user.id }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST'
        });
        const paymentBody = await payment.text();

        response.writeHead(payment.status, { 'Content-Type': 'application/json' });
        response.end(paymentBody);
        return;
      }

      sendJson(response, 404, { error: 'Route not found' });
    } catch (error) {
      if (error instanceof SyntaxError) {
        sendJson(response, 400, { error: 'Invalid JSON' });
        return;
      }

      sendJson(response, 502, { error: 'Service request failed' });
    }
  };
}
