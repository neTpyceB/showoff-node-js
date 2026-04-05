function readNumber(name, fallback) {
  return Number(process.env[name] ?? fallback);
}

export function readPort() {
  return readNumber('PORT', 3000);
}

export function readRedisUrl() {
  return process.env.REDIS_URL ?? 'redis://127.0.0.1:6379';
}

export function readRetryAfterMs() {
  return readNumber('RETRY_AFTER_MS', 100);
}

export function readServiceName() {
  return process.env.SERVICE_NAME ?? 'api';
}

export function readConsumerName() {
  return process.env.CONSUMER_NAME ?? `${readServiceName()}-${process.pid}`;
}
