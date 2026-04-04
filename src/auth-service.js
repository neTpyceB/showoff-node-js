import { readBearerToken } from './auth.js';
import { hashPassword, signToken, verifyPassword, verifyToken } from './crypto.js';
import { readJsonBody, sendJson } from './http.js';

export function createAuthHandler({ secret, users = [] }) {
  let nextId = users.length + 1;

  return async (request, response) => {
    const url = new URL(request.url, 'http://localhost');

    try {
      if (request.method === 'POST' && url.pathname === '/register') {
        const payload = await readJsonBody(request);
        const user = {
          email: payload.email,
          id: nextId,
          passwordHash: hashPassword(payload.password)
        };

        nextId += 1;
        users.push(user);
        sendJson(response, 201, { email: user.email, id: user.id });
        return;
      }

      if (request.method === 'POST' && url.pathname === '/login') {
        const payload = await readJsonBody(request);
        const user = users.find((entry) => entry.email === payload.email);

        if (!user || !verifyPassword(payload.password, user.passwordHash)) {
          sendJson(response, 401, { error: 'Unauthorized' });
          return;
        }

        sendJson(response, 200, {
          token: signToken({ email: user.email, id: user.id }, secret)
        });
        return;
      }

      if (request.method === 'GET' && url.pathname === '/verify') {
        const user = verifyToken(readBearerToken(request.headers.authorization), secret);

        if (!user) {
          sendJson(response, 401, { error: 'Unauthorized' });
          return;
        }

        sendJson(response, 200, user);
        return;
      }

      sendJson(response, 404, { error: 'Route not found' });
    } catch (error) {
      if (error instanceof SyntaxError) {
        sendJson(response, 400, { error: 'Invalid JSON' });
      }
    }
  };
}
