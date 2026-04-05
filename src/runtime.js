import { createApiHandler } from './api-app.js';
import { createLogger } from './logger.js';
import { connectRedisStore } from './store.js';
import { createWorkerRuntime } from './worker-runtime.js';

export async function createRuntime({
  connectRedisStoreImpl = connectRedisStore,
  consumerName,
  createLoggerImpl = createLogger,
  redisUrl,
  retryAfterMs,
  serviceName
}) {
  const log = createLoggerImpl();
  const store = await connectRedisStoreImpl(redisUrl);

  if (serviceName === 'api') {
    return {
      handler: createApiHandler({ store }),
      stop: async () => {
        await store.close?.();
      }
    };
  }

  const worker = createWorkerRuntime({
    consumerName,
    log,
    retryAfterMs,
    serviceName,
    store
  });

  return {
    handler: worker.handler,
    start: worker.start,
    stop: async () => {
      worker.stop();
      await store.close?.();
    },
    tick: worker.tick
  };
}
