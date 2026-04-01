import test from 'node:test';
import assert from 'node:assert/strict';
import { HttpError } from '../../src/http-error.js';
import { createErrorHandler, notFound } from '../../src/middleware/errors.js';

function createResponse() {
  return {
    body: null,
    statusCode: 200,
    json(payload) {
      this.body = payload;
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    }
  };
}

test('notFound forwards a 404 error', () => {
  let forwarded;

  notFound({}, {}, (error) => {
    forwarded = error;
  });

  assert.equal(forwarded.status, 404);
  assert.equal(forwarded.message, 'Route not found');
});

test('error handler returns known errors without logging', () => {
  const logs = [];
  const handleError = createErrorHandler({
    error(entry) {
      logs.push(entry);
    }
  });
  const res = createResponse();

  handleError(new HttpError(400, 'Invalid item name'), {}, res, () => {});

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { error: 'Invalid item name' });
  assert.deepEqual(logs, []);
});

test('error handler hides unknown errors and logs them', () => {
  const logs = [];
  const handleError = createErrorHandler({
    error(entry) {
      logs.push(entry);
    }
  });
  const res = createResponse();
  const error = new Error('boom');

  handleError(error, {}, res, () => {});

  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, { error: 'Internal server error' });
  assert.deepEqual(logs, [error]);
});
