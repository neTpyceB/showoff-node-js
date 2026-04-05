import test from 'node:test';
import assert from 'node:assert/strict';
import { connectRedisStore, wrapRedisStore } from '../../src/store.js';

test('store delegates redis commands and parses stream responses', async () => {
  const calls = [];
  const store = wrapRedisStore({
    async quit() {
      calls.push(['QUIT']);
    },
    async sendCommand(command) {
      calls.push(command);

      if (command[0] === 'XREADGROUP') {
        return [['events', [['1-0', ['eventId', '1', 'message', 'created order', 'userId', 'user-1']]]]];
      }

      if (command[0] === 'XAUTOCLAIM') {
        return ['0-0', [['1-0', ['eventId', '1', 'message', 'created order', 'userId', 'user-1']]], []];
      }

      if (command[0] === 'LRANGE') {
        return ['{"eventId":"1","message":"created order","userId":"user-1"}'];
      }

      return 'PONG';
    }
  });

  await store.addEvent({ eventId: '1', message: 'created order', userId: 'user-1' });
  await store.appendList('notifications:user-1', '{"eventId":"1"}');
  assert.deepEqual(await store.readNew('notifications', 'worker-1'), [
    {
      event: { eventId: '1', message: 'created order', userId: 'user-1' },
      id: '1-0'
    }
  ]);
  assert.deepEqual(await store.claimPending('notifications', 'worker-1', 100), [
    {
      event: { eventId: '1', message: 'created order', userId: 'user-1' },
      id: '1-0'
    }
  ]);
  assert.deepEqual(await store.readList('notifications:user-1'), ['{"eventId":"1","message":"created order","userId":"user-1"}']);
  assert.equal(await store.ping(), 'PONG');
  await store.ack('notifications', '1-0');
  await store.close();

  assert.deepEqual(calls, [
    ['XADD', 'events', '*', 'eventId', '1', 'message', 'created order', 'userId', 'user-1'],
    ['RPUSH', 'notifications:user-1', '{"eventId":"1"}'],
    ['XREADGROUP', 'GROUP', 'notifications', 'worker-1', 'COUNT', '10', 'STREAMS', 'events', '>'],
    ['XAUTOCLAIM', 'events', 'notifications', 'worker-1', '100', '0-0', 'COUNT', '10'],
    ['LRANGE', 'notifications:user-1', '0', '-1'],
    ['PING'],
    ['XACK', 'events', 'notifications', '1-0'],
    ['QUIT']
  ]);
});

test('store ensures groups and ignores existing-group errors', async () => {
  const commands = [];
  const store = wrapRedisStore({
    async quit() {},
    async sendCommand(command) {
      commands.push(command);

      if (command[0] === 'XGROUP') {
        throw new Error('BUSYGROUP Consumer Group name already exists');
      }
    }
  });

  await store.ensureGroup('notifications');
  assert.deepEqual(commands, [['XGROUP', 'CREATE', 'events', 'notifications', '0', 'MKSTREAM']]);
});

test('store ensures groups when creation succeeds', async () => {
  const commands = [];
  const store = wrapRedisStore({
    async quit() {},
    async sendCommand(command) {
      commands.push(command);
      return 'OK';
    }
  });

  await store.ensureGroup('feed');
  assert.deepEqual(commands, [['XGROUP', 'CREATE', 'events', 'feed', '0', 'MKSTREAM']]);
});

test('store returns empty arrays when redis has no entries', async () => {
  const store = wrapRedisStore({
    async quit() {},
    async sendCommand(command) {
      if (command[0] === 'XREADGROUP' || command[0] === 'XAUTOCLAIM') {
        return null;
      }

      return [];
    }
  });

  assert.deepEqual(await store.readNew('notifications', 'worker-1'), []);
  assert.deepEqual(await store.claimPending('notifications', 'worker-1', 100), []);
});

test('store rethrows non-BUSYGROUP errors', async () => {
  const store = wrapRedisStore({
    async quit() {},
    async sendCommand() {
      throw new Error('redis unavailable');
    }
  });

  await assert.rejects(() => store.ensureGroup('notifications'), {
    message: 'redis unavailable'
  });
});

test('connectRedisStore creates and connects a redis client', async () => {
  const calls = [];
  const store = await connectRedisStore('redis://cache.test:6379', (options) => {
    calls.push(['createClient', options]);

    return {
      async connect() {
        calls.push(['connect']);
      },
      async quit() {},
      async sendCommand() {
        return 'PONG';
      }
    };
  });

  assert.equal(await store.ping(), 'PONG');
  assert.deepEqual(calls, [
    ['createClient', { url: 'redis://cache.test:6379' }],
    ['connect']
  ]);
});
