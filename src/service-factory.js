import { createAuthHandler } from './auth-service.js';
import { createPaymentHandler } from './payment-service.js';
import { createUserHandler } from './user-service.js';

export function createServiceHandler({
  authSecret,
  authServiceUrl,
  paymentServiceUrl,
  serviceName
}) {
  switch (serviceName) {
    case 'auth':
      return createAuthHandler({ secret: authSecret });
    case 'user':
      return createUserHandler({ authServiceUrl, paymentServiceUrl });
    case 'payment':
      return createPaymentHandler({});
    default:
      throw new Error(`Unknown service: ${serviceName}`);
  }
}
