import IORedis from 'ioredis';

const client = new IORedis(process.env.REDIS_URL ?? 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: null
});

try {
  const result = await client.ping();

  process.exit(result === 'PONG' ? 0 : 1);
} finally {
  await client.quit();
}
