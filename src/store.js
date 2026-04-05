import { createClient } from 'redis';

function parseFields(fields) {
  const event = {};

  for (let index = 0; index < fields.length; index += 2) {
    event[fields[index]] = fields[index + 1];
  }

  return event;
}

function parseReadGroupResult(result) {
  if (!result) {
    return [];
  }

  return result[0][1].map(([id, fields]) => ({ event: parseFields(fields), id }));
}

function parseAutoClaimResult(result) {
  if (!result) {
    return [];
  }

  return result[1].map(([id, fields]) => ({ event: parseFields(fields), id }));
}

export function wrapRedisStore(client) {
  return {
    async ack(group, id) {
      await client.sendCommand(['XACK', 'events', group, id]);
    },
    async addEvent(event) {
      await client.sendCommand([
        'XADD',
        'events',
        '*',
        'eventId',
        event.eventId,
        'message',
        event.message,
        'userId',
        event.userId
      ]);
    },
    async appendList(key, value) {
      await client.sendCommand(['RPUSH', key, value]);
    },
    async claimPending(group, consumer, retryAfterMs, count = 10) {
      return parseAutoClaimResult(
        await client.sendCommand([
          'XAUTOCLAIM',
          'events',
          group,
          consumer,
          String(retryAfterMs),
          '0-0',
          'COUNT',
          String(count)
        ])
      );
    },
    async close() {
      await client.quit();
    },
    async ensureGroup(group) {
      try {
        await client.sendCommand(['XGROUP', 'CREATE', 'events', group, '0', 'MKSTREAM']);
      } catch (error) {
        if (!error.message.includes('BUSYGROUP')) {
          throw error;
        }
      }
    },
    async ping() {
      return client.sendCommand(['PING']);
    },
    async readList(key) {
      return client.sendCommand(['LRANGE', key, '0', '-1']);
    },
    async readNew(group, consumer, count = 10) {
      return parseReadGroupResult(
        await client.sendCommand([
          'XREADGROUP',
          'GROUP',
          group,
          consumer,
          'COUNT',
          String(count),
          'STREAMS',
          'events',
          '>'
        ])
      );
    }
  };
}

export async function connectRedisStore(url, createClientImpl = createClient) {
  const client = createClientImpl({ url });

  await client.connect();
  return wrapRedisStore(client);
}
