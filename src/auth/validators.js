import { HttpError } from '../http-error.js';

function parseString(value, message) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new HttpError(400, message);
  }

  return value;
}

export function parseEmail(value) {
  const email = parseString(value, 'Invalid email');

  if (!email.includes('@')) {
    throw new HttpError(400, 'Invalid email');
  }

  return email;
}

export function parsePassword(value) {
  return parseString(value, 'Invalid password');
}

export function parseCredentials(body) {
  return {
    email: parseEmail(body?.email),
    password: parsePassword(body?.password)
  };
}
