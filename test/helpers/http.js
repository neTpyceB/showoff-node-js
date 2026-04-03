import { createServer } from 'node:http';
import { once } from 'node:events';

export async function startServer(handler) {
  const server = createServer(handler);

  server.listen(0, '127.0.0.1');
  await once(server, 'listening');

  return {
    close: async () => {
      server.close();
      await once(server, 'close');
    },
    url: `http://127.0.0.1:${server.address().port}`
  };
}

export async function request(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      Connection: 'close',
      ...(options.headers ?? {})
    }
  });

  return {
    body: await response.text(),
    status: response.status
  };
}
