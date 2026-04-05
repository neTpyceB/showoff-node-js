import { createBackendHandler } from './backend-app.js';
import { createBalancerHandler } from './balancer-app.js';
import { connectRedisCache } from './cache.js';
import { createLogger } from './logger.js';
import { createMetrics } from './metrics.js';

export async function createRuntimeHandler({
  backendUrls,
  connectRedisCacheImpl = connectRedisCache,
  createLoggerImpl = createLogger,
  createMetricsImpl = createMetrics,
  instanceId,
  redisUrl,
  serviceName
}) {
  const log = createLoggerImpl();
  const metrics = createMetricsImpl();

  if (serviceName === 'backend') {
    return createBackendHandler({
      cache: await connectRedisCacheImpl(redisUrl),
      instanceId,
      log,
      metrics
    });
  }

  return createBalancerHandler({
    backendUrls,
    log,
    metrics
  });
}
