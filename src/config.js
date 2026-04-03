export function readPort(env = process.env) {
  return Number.parseInt(env.PORT ?? '3000', 10);
}

export function readQueueName(env = process.env) {
  return env.QUEUE_NAME ?? 'jobs';
}

export function readRedisUrl(env = process.env) {
  return env.REDIS_URL ?? 'redis://127.0.0.1:6379';
}
