import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable, Writable } from 'node:stream';
import { createArrayValueTransform, jsonToCsv } from '../../src/transforms/json-to-csv.js';

async function collect(streamFactory) {
  let output = '';

  await streamFactory(
    new Writable({
      write(chunk, _encoding, callback) {
        output += chunk.toString();
        callback();
      }
    })
  );

  return output;
}

test('array value transform extracts the array value field', async () => {
  const transform = createArrayValueTransform();
  const records = [];

  transform.on('data', (chunk) => {
    records.push(chunk);
  });

  transform.write({ key: 0, value: { name: 'alice' } });
  transform.end();

  await new Promise((resolve) => transform.on('end', resolve));

  assert.deepEqual(records, [{ name: 'alice' }]);
});

test('jsonToCsv streams array records as csv', async () => {
  const output = await collect((destination) =>
    jsonToCsv(Readable.from(['[{"name":"alice","score":10},{"name":"bob","score":20}]']), destination)
  );

  assert.equal(output, 'name,score\nalice,10\nbob,20\n');
});
