export function readBearerToken(header) {
  const match = header?.match(/^Bearer (.+)$/);

  return match?.[1] ?? null;
}

export function isAuthorized(header, expectedToken) {
  return readBearerToken(header) === expectedToken;
}
