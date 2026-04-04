import { readJsonBody, sendJson } from './http.js';

export function createPaymentHandler({ payments = [] }) {
  let nextId = payments.length + 1;

  return async (request, response) => {
    const url = new URL(request.url, 'http://localhost');

    try {
      if (request.method === 'POST' && url.pathname === '/payments') {
        const payload = await readJsonBody(request);
        const payment = {
          amount: payload.amount,
          id: nextId,
          status: 'approved',
          userId: payload.userId
        };

        nextId += 1;
        payments.push(payment);
        sendJson(response, 201, payment);
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
