export function createLoggerMiddleware(log = process.stdout.write.bind(process.stdout)) {
  return (req, res, next) => {
    const startedAt = process.hrtime.bigint();

    res.on('finish', () => {
      log(
        `${JSON.stringify({
          durationMs: Number(process.hrtime.bigint() - startedAt) / 1e6,
          method: req.method,
          path: req.originalUrl,
          statusCode: res.statusCode
        })}\n`
      );
    });

    next();
  };
}
