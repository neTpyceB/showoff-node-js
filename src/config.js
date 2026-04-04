export function readPort(env = process.env) {
  return Number.parseInt(env.PORT ?? '3000', 10);
}

export function readAuthToken(env = process.env) {
  return env.AUTH_TOKEN ?? 'platform-token';
}

export function readRateLimitLimit(env = process.env) {
  return Number.parseInt(env.RATE_LIMIT_LIMIT ?? '2', 10);
}

export function readRateLimitWindowMs(env = process.env) {
  return Number.parseInt(env.RATE_LIMIT_WINDOW_MS ?? '1000', 10);
}

export function readRoutes(env = process.env) {
  return [
    {
      prefix: '/service-a',
      service: 'service-a',
      targetUrl: env.SERVICE_A_URL ?? 'http://127.0.0.1:3001'
    },
    {
      prefix: '/service-b',
      service: 'service-b',
      targetUrl: env.SERVICE_B_URL ?? 'http://127.0.0.1:3002'
    }
  ];
}

export function readServiceName(env = process.env) {
  return env.SERVICE_NAME ?? 'service';
}
