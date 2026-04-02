import express from 'express';
import { HttpError } from '../http-error.js';
import { hashPassword, verifyPassword } from './password.js';
import { issueToken } from './tokens.js';
import { parseCredentials } from './validators.js';

function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role
  };
}

export function createAuthRouter({ store, jwtSecret, requireAuth, requireRole }) {
  const router = express.Router();

  router.post('/register', (req, res) => {
    const { email, password } = parseCredentials(req.body);

    if (store.findByEmail(email)) {
      throw new HttpError(409, 'User already exists');
    }

    const user = store.create({
      email,
      passwordHash: hashPassword(password),
      role: 'user'
    });

    res.status(201).json(toPublicUser(user));
  });

  router.post('/login', (req, res) => {
    const { email, password } = parseCredentials(req.body);
    const user = store.findByEmail(email);

    if (!user || !verifyPassword(password, user.passwordHash)) {
      throw new HttpError(401, 'Invalid credentials');
    }

    res.json({ token: issueToken(user, jwtSecret) });
  });

  router.get('/me', requireAuth, (req, res) => {
    res.json(toPublicUser(req.user));
  });

  router.get('/admin', requireAuth, requireRole('admin'), (req, res) => {
    res.json({ access: 'granted' });
  });

  return router;
}
