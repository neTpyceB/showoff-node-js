import { HttpError } from '../http-error.js';

export function parseItemId(value) {
  const id = Number.parseInt(value, 10);

  if (!Number.isInteger(id) || String(id) !== value || id < 1) {
    throw new HttpError(400, 'Invalid item id');
  }

  return id;
}

export function parseItemName(payload) {
  if (typeof payload?.name !== 'string' || payload.name.length === 0) {
    throw new HttpError(400, 'Invalid item name');
  }

  return payload.name;
}
