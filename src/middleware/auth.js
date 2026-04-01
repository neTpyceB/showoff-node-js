import { HttpError } from '../http-error.js';
import { verifyToken } from '../auth/tokens.js';

export function createAuthMiddleware({ store, jwtSecret }) {
  return (req, _res, next) => {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      next(new HttpError(401, 'Authentication required'));
      return;
    }

    try {
      const payload = verifyToken(authorization.slice(7), jwtSecret);
      const user = store.findById(Number.parseInt(payload.sub, 10));

      if (!user) {
        throw new HttpError(401, 'Authentication required');
      }

      req.user = user;
      next();
    } catch (error) {
      next(error instanceof HttpError ? error : new HttpError(401, 'Authentication required'));
    }
  };
}

export function requireRole(role) {
  return (req, _res, next) => {
    if (req.user.role !== role) {
      next(new HttpError(403, 'Forbidden'));
      return;
    }

    next();
  };
}
