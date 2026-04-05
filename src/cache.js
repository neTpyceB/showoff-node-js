import { createClient } from 'redis';

export function wrapRedisClient(client) {
  return {
    async get(key) {
      return client.get(key);
    },
    async ping() {
      return client.ping();
    },
    async set(key, value, ttlSeconds) {
      await client.set(key, value, { EX: ttlSeconds });
    }
  };
}

export async function connectRedisCache(url, createClientImpl = createClient) {
  const client = createClientImpl({ url });

  await client.connect();
  return wrapRedisClient(client);
}
