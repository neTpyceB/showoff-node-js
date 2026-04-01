import { createApp } from './app.js';

function required(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing ${name}`);
  }

  return value;
}

const app = createApp({
  adminEmail: required('ADMIN_EMAIL'),
  adminPassword: required('ADMIN_PASSWORD'),
  jwtSecret: required('JWT_SECRET')
});
const port = Number.parseInt(process.env.PORT ?? '3000', 10);

app.listen(port, () => {
  process.stdout.write(`Listening on ${port}\n`);
});
