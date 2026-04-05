import { createApiHandler } from '../../src/api-app.js';
import { createWorkerRuntime } from '../../src/worker-runtime.js';
import { createFakeStore } from './fake-store.js';
import { startServer } from './http.js';

export async function startPlatform() {
  const store = createFakeStore();
  const api = await startServer(createApiHandler({ store }));
  const notifications = createWorkerRuntime({
    consumerName: 'notifications-1',
    log: () => {},
    retryAfterMs: 0,
    serviceName: 'notifications',
    store
  });
  const feed = createWorkerRuntime({
    consumerName: 'feed-1',
    log: () => {},
    retryAfterMs: 0,
    serviceName: 'feed',
    store
  });
  const audit = createWorkerRuntime({
    consumerName: 'audit-1',
    log: () => {},
    retryAfterMs: 0,
    serviceName: 'audit',
    store
  });
  const notificationsServer = await startServer(notifications.handler);
  const feedServer = await startServer(feed.handler);
  const auditServer = await startServer(audit.handler);
  const stopNotifications = notifications.start();
  const stopFeed = feed.start();
  const stopAudit = audit.start();

  return {
    api,
    auditServer,
    close: async () => {
      stopNotifications();
      stopFeed();
      stopAudit();
      await api.close();
      await notificationsServer.close();
      await feedServer.close();
      await auditServer.close();
    },
    feedServer,
    notificationsServer
  };
}
