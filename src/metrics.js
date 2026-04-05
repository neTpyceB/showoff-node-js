export function createMetrics() {
  let cacheHitsTotal = 0;
  let cacheMissesTotal = 0;
  let errorsTotal = 0;
  let requestsTotal = 0;

  return {
    recordCacheHit() {
      cacheHitsTotal += 1;
    },
    recordCacheMiss() {
      cacheMissesTotal += 1;
    },
    recordError() {
      errorsTotal += 1;
    },
    recordRequest() {
      requestsTotal += 1;
    },
    snapshot() {
      return {
        cacheHitsTotal,
        cacheMissesTotal,
        errorsTotal,
        requestsTotal
      };
    }
  };
}
