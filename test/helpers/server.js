import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from '../../src/app.js';

export async function startServer() {
  const directory = await mkdtemp(join(tmpdir(), 'chat-backend-'));
  const databasePath = join(directory, 'chat.sqlite');
  const app = createApp({ databasePath });

  await new Promise((resolve) => {
    app.server.listen(0, '127.0.0.1', resolve);
  });

  const { port } = app.server.address();

  return {
    close: async () => {
      await app.close();
      await rm(directory, { force: true, recursive: true });
    },
    databasePath,
    url: `http://127.0.0.1:${port}`
  };
}
