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

test('error handler formats known errors', () => {
  const handleError = createErrorHandler();
  const response = createResponse();

  handleError(new HttpError(401, 'Authentication required'), {}, response, () => {});

  assert.equal(response.statusCode, 401);
  assert.deepEqual(response.body, { error: 'Authentication required' });
});

test('error handler formats invalid json and unknown errors', () => {
  const handleError = createErrorHandler();
  const invalidJson = createResponse();
  const unknown = createResponse();

  handleError({ type: 'entity.parse.failed' }, {}, invalidJson, () => {});
  handleError(new Error('boom'), {}, unknown, () => {});

  assert.equal(invalidJson.statusCode, 400);
  assert.deepEqual(invalidJson.body, { error: 'Invalid JSON' });
  assert.equal(unknown.statusCode, 500);
  assert.deepEqual(unknown.body, { error: 'Internal server error' });
});
