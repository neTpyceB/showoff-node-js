import { sendJson } from './http.js';
import { listKey, serializeEvent } from './projection.js';

async function processEntry({ entry, log, serviceName, store }) {
  try {
    await store.appendList(listKey(serviceName, entry.event.userId), serializeEvent(entry.event));
    await store.ack(serviceName, entry.id);
    log({ eventId: entry.event.eventId, service: serviceName, status: 'processed' });
  } catch {
    log({ eventId: entry.event.eventId, service: serviceName, status: 'failed' });
  }
}

export function createWorkerRuntime({
  consumerName,
  log,
  pollMs = 50,
  retryAfterMs = 100,
  serviceName,
  store
}) {
  let active = false;
  let timer = null;

  async function tick() {
    await store.ensureGroup(serviceName);

    for (const entry of await store.claimPending(serviceName, consumerName, retryAfterMs)) {
      await processEntry({ entry, log, serviceName, store });
    }

    for (const entry of await store.readNew(serviceName, consumerName)) {
      await processEntry({ entry, log, serviceName, store });
    }
  }

  function handler(request, response) {
    if (request.method === 'GET' && request.url === '/health') {
      store
        .ping()
        .then(() => sendJson(response, 200, { service: serviceName, status: 'ok' }))
        .catch(() => sendJson(response, 503, { service: serviceName, status: 'error' }));
      return;
    }

    sendJson(response, 404, { error: 'Route not found' });
  }

  function stop() {
    active = false;

    if (timer) {
      clearTimeout(timer);
    }
  }

  function start() {
    if (active) {
      return stop;
    }

    active = true;

    const loop = async () => {
      if (!active) {
        return;
      }

      await tick().catch(() => {});
      timer = setTimeout(loop, pollMs);
    };

    void loop();

    return stop;
  }

  return {
    handler,
    start,
    stop,
    tick
  };
}
