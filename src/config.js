function readNumber(name, fallback) {
  return Number(process.env[name] ?? fallback);
}

export function readBackendUrls() {
  return (process.env.BACKEND_URLS ?? 'http://127.0.0.1:3001,http://127.0.0.1:3002').split(',');
}

export function readInstanceId() {
  return process.env.INSTANCE_ID ?? 'backend-a';
}

export function readPort() {
  return readNumber('PORT', 3000);
}

export function readRedisUrl() {
  return process.env.REDIS_URL ?? 'redis://127.0.0.1:6379';
}

export function readServiceName() {
  return process.env.SERVICE_NAME ?? 'balancer';
}
