import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { stringify } from 'csv-stringify';
import StreamArray from 'stream-json/streamers/stream-array.js';

export function createArrayValueTransform() {
  return new Transform({
    writableObjectMode: true,
    readableObjectMode: true,
    transform(chunk, _encoding, callback) {
      callback(null, chunk.value);
    }
  });
}

export async function jsonToCsv(input, output) {
  await pipeline(
    input,
    StreamArray.withParserAsStream(),
    createArrayValueTransform(),
    stringify({ header: true }),
    output
  );
}
