import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable, Writable } from 'node:stream';
import { csvToNdjson, createNdjsonStringifier } from '../../src/transforms/csv-to-ndjson.js';

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

test('ndjson stringifier formats records as lines', async () => {
  const stringifier = createNdjsonStringifier();
  let output = '';

  stringifier.on('data', (chunk) => {
    output += chunk.toString();
  });

  stringifier.write({ name: 'alice', score: '10' });
  stringifier.end();

  await new Promise((resolve) => stringifier.on('end', resolve));

  assert.equal(output, '{"name":"alice","score":"10"}\n');
});

test('csvToNdjson streams csv rows as ndjson', async () => {
  const output = await collect((destination) =>
    csvToNdjson(Readable.from(['name,score\nalice,10\nbob,20\n']), destination)
  );

  assert.equal(output, '{"name":"alice","score":"10"}\n{"name":"bob","score":"20"}\n');
});
