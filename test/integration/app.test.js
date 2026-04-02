import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../../src/app.js';

function createTestApp() {
  return createApp({
    adminEmail: 'admin@example.com',
    adminPassword: 'admin-password',
    jwtSecret: 'secret',
    log: () => {}
  });
}

test('app supports register, login, auth, and admin access', async () => {
  const app = createTestApp();

  const register = await request(app)
    .post('/auth/register')
    .send({ email: 'user@example.com', password: 'password123' })
    .expect(201);

  assert.deepEqual(register.body, {
    id: 2,
    email: 'user@example.com',
    role: 'user'
  });

  const login = await request(app)
    .post('/auth/login')
    .send({ email: 'user@example.com', password: 'password123' })
    .expect(200);

  const userToken = login.body.token;

  await request(app)
    .get('/auth/me')
    .set('Authorization', `Bearer ${userToken}`)
    .expect(200, {
      id: 2,
      email: 'user@example.com',
      role: 'user'
    });

  await request(app)
    .get('/auth/admin')
    .set('Authorization', `Bearer ${userToken}`)
    .expect(403, { error: 'Forbidden' });

  const adminLogin = await request(app)
    .post('/auth/login')
    .send({ email: 'admin@example.com', password: 'admin-password' })
    .expect(200);

  await request(app)
    .get('/auth/admin')
    .set('Authorization', `Bearer ${adminLogin.body.token}`)
    .expect(200, { access: 'granted' });
});

test('app returns expected auth errors', async () => {
  const app = createTestApp();

  await request(app).post('/auth/register').send({ email: 'bad', password: 'password123' }).expect(400, {
    error: 'Invalid email'
  });
  await request(app).post('/auth/register').send({ email: 'user@example.com', password: '' }).expect(400, {
    error: 'Invalid password'
  });
  await request(app).post('/auth/login').send({ email: 'user@example.com', password: 'password123' }).expect(401, {
    error: 'Invalid credentials'
  });
  await request(app).get('/auth/me').expect(401, { error: 'Authentication required' });
  await request(app).get('/missing').expect(404, { error: 'Route not found' });
});

test('app rejects duplicate users and invalid json', async () => {
  const app = createTestApp();

  await request(app)
    .post('/auth/register')
    .send({ email: 'user@example.com', password: 'password123' })
    .expect(201);

  await request(app)
    .post('/auth/register')
    .send({ email: 'user@example.com', password: 'password123' })
    .expect(409, { error: 'User already exists' });

  await request(app)
    .post('/auth/login')
    .set('Content-Type', 'application/json')
    .send('{"email":')
    .expect(400, { error: 'Invalid JSON' });
});
