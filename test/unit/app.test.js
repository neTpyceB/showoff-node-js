import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { Readable } from 'node:stream';
import { createHandler } from '../../src/app.js';

test('csv-to-ndjson waits for drain when the response applies backpressure', async () => {
  const request = Readable.from(['name\nalice\n']);
  request.method = 'POST';
  request.url = '/transform/csv-to-ndjson';

  const response = Object.assign(new EventEmitter(), {
    headers: {},
    statusCode: 0,
    writableEnded: false,
    setHeader(name, value) {
      this.headers[name] = value;
    },
    write(chunk) {
      this.body = `${this.body ?? ''}${chunk.toString()}`;
      setImmediate(() => this.emit('drain'));
      return false;
    },
    end(callback) {
      this.writableEnded = true;
      callback?.();
    },
    destroy(error) {
      throw error;
    }
  });

  await createHandler()(request, response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.headers['Content-Type'], 'application/x-ndjson');
  assert.equal(response.body, '{"name":"alice"}\n');
  assert.equal(response.writableEnded, true);
});
