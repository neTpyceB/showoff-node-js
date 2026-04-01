import test from 'node:test';
import assert from 'node:assert/strict';
import { createAuthMiddleware, requireRole } from '../../src/middleware/auth.js';
import { issueToken } from '../../src/auth/tokens.js';

function createStore(user) {
  return {
    findById(id) {
      return id === user.id ? user : null;
    }
  };
}

test('auth middleware loads the current user', () => {
  const user = { id: 1, role: 'user' };
  const middleware = createAuthMiddleware({ store: createStore(user), jwtSecret: 'secret' });
  const req = {
    headers: {
      authorization: `Bearer ${issueToken(user, 'secret')}`
    }
  };

  middleware(req, {}, (error) => {
    assert.equal(error, undefined);
    assert.equal(req.user, user);
  });
});

test('auth middleware rejects missing or invalid auth', () => {
  const middleware = createAuthMiddleware({
    store: createStore({ id: 1, role: 'user' }),
    jwtSecret: 'secret'
  });

  middleware({ headers: {} }, {}, (error) => {
    assert.equal(error.status, 401);
  });

  middleware({ headers: { authorization: 'Bearer broken' } }, {}, (error) => {
    assert.equal(error.status, 401);
  });
});

test('auth middleware rejects tokens for missing users', () => {
  const middleware = createAuthMiddleware({
    store: createStore({ id: 2, role: 'user' }),
    jwtSecret: 'secret'
  });

  middleware(
    {
      headers: {
        authorization: `Bearer ${issueToken({ id: 1, role: 'user' }, 'secret')}`
      }
    },
    {},
    (error) => {
      assert.equal(error.status, 401);
    }
  );
});

test('requireRole enforces role membership', () => {
  const middleware = requireRole('admin');

  middleware({ user: { role: 'admin' } }, {}, (error) => {
    assert.equal(error, undefined);
  });

  middleware({ user: { role: 'user' } }, {}, (error) => {
    assert.equal(error.status, 403);
  });
});
