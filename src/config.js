function readNumber(name, fallback) {
  return Number(process.env[name] ?? fallback);
}

export function readAuthSecret() {
  return process.env.AUTH_SECRET ?? 'platform-secret';
}

export function readAuthServiceUrl() {
  return process.env.AUTH_SERVICE_URL ?? 'http://127.0.0.1:3000';
}

export function readPaymentServiceUrl() {
  return process.env.PAYMENT_SERVICE_URL ?? 'http://127.0.0.1:3002';
}

export function readPort() {
  return readNumber('PORT', 3000);
}

export function readServiceName() {
  return process.env.SERVICE_NAME ?? 'auth';
}
