import { HttpError } from '../http-error.js';

export function notFound(_req, _res, next) {
  next(new HttpError(404, 'Route not found'));
}

export function createErrorHandler(logger) {
  return (error, _req, res, _next) => {
    const status = Number.isInteger(error.status) ? error.status : 500;
    const message = status === 500 ? 'Internal server error' : error.message;

    if (status === 500) {
      logger.error(error);
    }

    res.status(status).json({ error: message });
  };
}
