import { Writable } from 'node:stream';
import { csvToNdjson } from './transforms/csv-to-ndjson.js';
import { jsonToCsv } from './transforms/json-to-csv.js';
import { mapError, sendJsonError } from './errors.js';

function createResponseWriter(response, contentType) {
  let started = false;

  return {
    started: () => started,
    writable: new Writable({
      write(chunk, _encoding, callback) {
        if (!started) {
          response.statusCode = 200;
          response.setHeader('Content-Type', contentType);
          started = true;
        }

        if (response.write(chunk)) {
          callback();
          return;
        }

        response.once('drain', callback);
      },
      final(callback) {
        if (!started) {
          response.statusCode = 200;
          response.setHeader('Content-Type', contentType);
        }

        response.end(callback);
      }
    })
  };
}

async function handleTransform(request, response, contentType, transform) {
  const writer = createResponseWriter(response, contentType);

  try {
    await transform(request, writer.writable);
  } catch (error) {
    const mapped = mapError(error);

    if (writer.started() || response.writableEnded) {
      response.destroy(error);
      return;
    }

    sendJsonError(response, mapped.status, mapped.message);
  }
}

export function createHandler() {
  return async (request, response) => {
    if (request.method === 'POST' && request.url === '/transform/csv-to-ndjson') {
      await handleTransform(request, response, 'application/x-ndjson', csvToNdjson);
      return;
    }

    if (request.method === 'POST' && request.url === '/transform/json-to-csv') {
      await handleTransform(request, response, 'text/csv; charset=utf-8', jsonToCsv);
      return;
    }

    sendJsonError(response, 404, 'Route not found');
  };
}
