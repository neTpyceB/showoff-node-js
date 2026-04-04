export function readBearerToken(header) {
  if (!header?.startsWith('Bearer ')) {
    return null;
  }

  return header.slice(7);
}
