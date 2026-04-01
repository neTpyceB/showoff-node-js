import express from 'express';
import { createAuthRouter } from './auth/router.js';
import { hashPassword } from './auth/password.js';
import { createUserStore } from './auth/store.js';
import { createAuthMiddleware, requireRole } from './middleware/auth.js';
import { createErrorHandler, notFound } from './middleware/errors.js';
import { createLoggerMiddleware } from './middleware/logger.js';

export function createApp({
  adminEmail,
  adminPassword,
  jwtSecret,
  log = process.stdout.write.bind(process.stdout)
}) {
  const app = express();
  const store = createUserStore();

  store.create({
    email: adminEmail,
    passwordHash: hashPassword(adminPassword),
    role: 'admin'
  });

  app.use(createLoggerMiddleware(log));
  app.use(express.json());
  app.use(
    '/auth',
    createAuthRouter({
      store,
      jwtSecret,
      requireAuth: createAuthMiddleware({ store, jwtSecret }),
      requireRole
    })
  );
  app.use(notFound);
  app.use(createErrorHandler());

  return app;
}
