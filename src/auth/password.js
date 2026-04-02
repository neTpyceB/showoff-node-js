import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = scryptSync(password, salt, 64).toString('hex');

  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password, passwordHash) {
  const [salt, storedHash] = passwordHash.split(':');
  const derivedKey = scryptSync(password, salt, 64);
  const storedBuffer = Buffer.from(storedHash, 'hex');

  return timingSafeEqual(derivedKey, storedBuffer);
}
