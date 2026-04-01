import express from 'express';
import pino from 'pino';
import { createItemsRouter } from './items/router.js';
import { createErrorHandler, notFound } from './middleware/errors.js';
import { createLoggerMiddleware } from './middleware/logger.js';
import { createItemStore } from './items/store.js';

export function createApp({ logger = pino({ enabled: process.env.NODE_ENV !== 'test' }) } = {}) {
  const app = express();
  const store = createItemStore();

  app.use(createLoggerMiddleware(logger));
  app.use(express.json());
  app.use('/items', createItemsRouter(store));
  app.use(notFound);
  app.use(createErrorHandler(logger));

  return app;
}
