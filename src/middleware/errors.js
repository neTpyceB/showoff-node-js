import { HttpError } from '../http-error.js';

export function notFound(_req, _res, next) {
  next(new HttpError(404, 'Route not found'));
}

export function createErrorHandler() {
  return (error, _req, res, _next) => {
    if (error?.type === 'entity.parse.failed') {
      res.status(400).json({ error: 'Invalid JSON' });
      return;
    }

    const status = Number.isInteger(error.status) ? error.status : 500;
    const message = status === 500 ? 'Internal server error' : error.message;

    res.status(status).json({ error: message });
  };
}
