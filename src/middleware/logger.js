export function createLoggerMiddleware(logger) {
  return (req, res, next) => {
    const start = process.hrtime.bigint();

    res.on('finish', () => {
      logger.info(
        {
          durationMs: Number(process.hrtime.bigint() - start) / 1e6,
          method: req.method,
          path: req.originalUrl,
          statusCode: res.statusCode
        },
        'request completed'
      );
    });

    next();
  };
}
