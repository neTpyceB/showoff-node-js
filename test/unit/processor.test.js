import test from 'node:test';
import assert from 'node:assert/strict';
import { processJob } from '../../src/processor.js';

test('processor retries until the configured attempt and then completes', () => {
  assert.throws(
    () => processJob({ value: 'hello', failUntilAttempt: 2 }, 1),
    /retry_2/
  );
  assert.deepEqual(processJob({ value: 'hello', failUntilAttempt: 1 }, 1), {
    output: 'HELLO'
  });
});
