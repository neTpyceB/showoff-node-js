import assert from 'node:assert/strict';

const baseUrl = process.env.API_URL ?? 'http://localhost:3000';
const enqueueResponse = await fetch(`${baseUrl}/jobs`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    value: 'hello',
    delayMs: 400,
    failUntilAttempt: 1
  })
});

assert.equal(enqueueResponse.status, 201);

const { id } = await enqueueResponse.json();
let sawDelayed = false;

for (let attempt = 0; attempt < 40; attempt += 1) {
  const response = await fetch(`${baseUrl}/jobs/${id}`);
  const job = await response.json();

  assert.equal(response.status, 200);

  if (job.state === 'delayed') {
    sawDelayed = true;
  }

  if (job.state === 'completed') {
    assert.equal(sawDelayed, true);
    assert.equal(job.attemptsMade, 2);
    assert.equal(job.failedReason, null);
    assert.deepEqual(job.result, { output: 'HELLO' });
    process.stdout.write('Queue smoke passed\n');
    process.exit(0);
  }

  await new Promise((resolve) => setTimeout(resolve, 100));
}

process.exit(1);
