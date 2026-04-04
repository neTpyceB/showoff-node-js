export function createRateLimiter({ limit, now = Date.now, windowMs }) {
  const buckets = new Map();

  return {
    check(key) {
      const current = now();
      const bucket = buckets.get(key);

      if (!bucket || bucket.resetAt <= current) {
        const next = { count: 1, resetAt: current + windowMs };
        buckets.set(key, next);
        return { allowed: true, remaining: limit - 1, resetAt: next.resetAt };
      }

      if (bucket.count >= limit) {
        return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
      }

      bucket.count += 1;
      return { allowed: true, remaining: limit - bucket.count, resetAt: bucket.resetAt };
    }
  };
}
