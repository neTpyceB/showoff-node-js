import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../../src/app.js';

function createLogger() {
  return {
    entries: [],
    errors: [],
    info(entry, message) {
      this.entries.push({ entry, message });
    },
    error(entry) {
      this.errors.push(entry);
    }
  };
}

test('app supports the full CRUD flow', async () => {
  const logger = createLogger();
  const app = createApp({ logger });

  await request(app).get('/items').expect(200, []);

  const created = await request(app)
    .post('/items')
    .send({ name: 'first' })
    .expect(201);

  assert.deepEqual(created.body, { id: 1, name: 'first' });

  await request(app).get('/items/1').expect(200, { id: 1, name: 'first' });
  await request(app).put('/items/1').send({ name: 'updated' }).expect(200, { id: 1, name: 'updated' });
  await request(app).get('/items').expect(200, [{ id: 1, name: 'updated' }]);
  await request(app).delete('/items/1').expect(204);
  await request(app).get('/items').expect(200, []);
  assert.equal(logger.entries.length >= 6, true);
  assert.deepEqual(logger.errors, []);
});

test('app returns validation and not-found errors', async () => {
  const app = createApp({ logger: createLogger() });

  await request(app).post('/items').send({}).expect(400, { error: 'Invalid item name' });
  await request(app).get('/items/abc').expect(400, { error: 'Invalid item id' });
  await request(app).get('/items/1').expect(404, { error: 'Item not found' });
  await request(app).put('/items/1').send({ name: 'missing' }).expect(404, { error: 'Item not found' });
  await request(app).delete('/items/1').expect(404, { error: 'Item not found' });
  await request(app).get('/missing').expect(404, { error: 'Route not found' });
});

test('app returns JSON parse errors', async () => {
  const app = createApp({ logger: createLogger() });

  await request(app)
    .post('/items')
    .set('Content-Type', 'application/json')
    .send('{"name":')
    .expect(400);
});
