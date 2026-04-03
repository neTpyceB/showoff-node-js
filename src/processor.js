export function processJob(payload, attemptsMade) {
  if (attemptsMade < payload.failUntilAttempt) {
    throw new Error(`retry_${attemptsMade + 1}`);
  }

  return { output: payload.value.toUpperCase() };
}
