import { createServer } from 'node:http';
import { createChatServer } from './chat.js';
import { createMessageStore } from './store.js';

export function createApp({ databasePath }) {
  const store = createMessageStore(databasePath);
  const server = createServer((_request, response) => {
    response.writeHead(426, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: 'WebSocket upgrade required' }));
  });
  const chatServer = createChatServer({ server, store });

  return {
    close: async () => {
      await new Promise((resolve) => chatServer.close(resolve));
      await new Promise((resolve) => server.close(resolve));
      store.close();
    },
    server
  };
}
