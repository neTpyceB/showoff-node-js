import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { parse } from 'csv-parse';

export function createNdjsonStringifier() {
  return new Transform({
    writableObjectMode: true,
    transform(record, _encoding, callback) {
      callback(null, `${JSON.stringify(record)}\n`);
    }
  });
}

export async function csvToNdjson(input, output) {
  await pipeline(
    input,
    parse({ columns: true }),
    createNdjsonStringifier(),
    output
  );
}
