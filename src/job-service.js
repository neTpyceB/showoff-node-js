export function createJobService({ addJob, loadJob }) {
  return {
    async enqueueJob(payload) {
      const job = await addJob(payload, {
        attempts: payload.failUntilAttempt + 1,
        delay: payload.delayMs
      });

      return { id: String(job.id) };
    },
    async getJob(id) {
      const job = await loadJob(id);

      if (!job) {
        return null;
      }

      const state = await job.getState();

      return {
        attemptsMade: job.attemptsMade,
        failedReason: state === 'completed' ? null : job.failedReason || null,
        id: String(job.id),
        result: job.returnvalue ?? null,
        state
      };
    }
  };
}
