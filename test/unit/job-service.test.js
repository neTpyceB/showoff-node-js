import test from 'node:test';
import assert from 'node:assert/strict';
import { createJobService } from '../../src/job-service.js';

test('job service enqueues jobs and reads job status', async () => {
  const added = [];
  const jobService = createJobService({
    async addJob(payload, options) {
      added.push({ payload, options });
      return { id: 7 };
    },
    async loadJob(id) {
      if (id === 'missing') {
        return null;
      }

      if (id === 'failed') {
        return {
          id,
          attemptsMade: 2,
          failedReason: 'retry_2',
          returnvalue: null,
          async getState() {
            return 'failed';
          }
        };
      }

      if (id === 'waiting') {
        return {
          id,
          attemptsMade: 0,
          failedReason: '',
          returnvalue: null,
          async getState() {
            return 'waiting';
          }
        };
      }

      return {
        id,
        attemptsMade: 1,
        failedReason: '',
        returnvalue: { output: 'HELLO' },
        async getState() {
          return 'completed';
        }
      };
    }
  });

  assert.deepEqual(
    await jobService.enqueueJob({ value: 'hello', delayMs: 500, failUntilAttempt: 2 }),
    { id: '7' }
  );
  assert.deepEqual(added, [
    {
      payload: { value: 'hello', delayMs: 500, failUntilAttempt: 2 },
      options: { attempts: 3, delay: 500 }
    }
  ]);
  assert.deepEqual(await jobService.getJob('8'), {
    id: '8',
    state: 'completed',
    attemptsMade: 1,
    result: { output: 'HELLO' },
    failedReason: null
  });
  assert.deepEqual(await jobService.getJob('failed'), {
    id: 'failed',
    state: 'failed',
    attemptsMade: 2,
    result: null,
    failedReason: 'retry_2'
  });
  assert.deepEqual(await jobService.getJob('waiting'), {
    id: 'waiting',
    state: 'waiting',
    attemptsMade: 0,
    result: null,
    failedReason: null
  });
  assert.equal(await jobService.getJob('missing'), null);
});
