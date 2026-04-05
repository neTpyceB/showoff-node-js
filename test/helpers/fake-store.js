export function createFakeStore() {
  let nextId = 1;
  const events = [];
  const groups = new Map();
  const lists = new Map();

  function stateFor(group) {
    if (!groups.has(group)) {
      groups.set(group, {
        acked: new Set(),
        pending: new Map(),
        seen: new Set()
      });
    }

    return groups.get(group);
  }

  return {
    async ack(group, id) {
      stateFor(group).pending.delete(id);
      stateFor(group).acked.add(id);
    },
    async addEvent(event) {
      events.push({
        event,
        id: `${nextId}-0`
      });
      nextId += 1;
    },
    async appendList(key, value) {
      const list = lists.get(key) ?? [];

      list.push(value);
      lists.set(key, list);
    },
    async claimPending(group, consumer, retryAfterMs) {
      const state = stateFor(group);
      const claimed = [];

      for (const pending of state.pending.values()) {
        if (Date.now() - pending.deliveredAt >= retryAfterMs) {
          pending.consumer = consumer;
          pending.deliveredAt = Date.now();
          claimed.push(pending.entry);
        }
      }

      return claimed;
    },
    async close() {},
    async ensureGroup(group) {
      stateFor(group);
    },
    async ping() {
      return 'PONG';
    },
    async readList(key) {
      return lists.get(key) ?? [];
    },
    async readNew(group, consumer) {
      const state = stateFor(group);
      const entries = [];

      for (const entry of events) {
        if (state.seen.has(entry.id) || state.acked.has(entry.id)) {
          continue;
        }

        state.seen.add(entry.id);
        state.pending.set(entry.id, {
          consumer,
          deliveredAt: Date.now(),
          entry
        });
        entries.push(entry);
      }

      return entries;
    }
  };
}
