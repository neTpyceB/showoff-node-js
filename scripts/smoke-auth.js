const baseUrl = process.env.API_URL;
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!baseUrl || !adminEmail || !adminPassword) {
  process.stderr.write('Missing API_URL, ADMIN_EMAIL, or ADMIN_PASSWORD\n');
  process.exit(1);
}

const userEmail = 'user@example.com';
const userPassword = 'password123';

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const text = await response.text();

  return {
    body: text ? JSON.parse(text) : null,
    status: response.status
  };
}

let response = await request('/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: userEmail, password: userPassword })
});

if (response.status !== 201 || response.body.role !== 'user') {
  process.exit(1);
}

response = await request('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: userEmail, password: userPassword })
});

if (response.status !== 200 || typeof response.body.token !== 'string') {
  process.exit(1);
}

const userToken = response.body.token;

response = await request('/auth/me', {
  headers: { Authorization: `Bearer ${userToken}` }
});

if (response.status !== 200 || response.body.email !== userEmail) {
  process.exit(1);
}

response = await request('/auth/admin', {
  headers: { Authorization: `Bearer ${userToken}` }
});

if (response.status !== 403) {
  process.exit(1);
}

response = await request('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: adminEmail, password: adminPassword })
});

if (response.status !== 200 || typeof response.body.token !== 'string') {
  process.exit(1);
}

response = await request('/auth/admin', {
  headers: { Authorization: `Bearer ${response.body.token}` }
});

if (response.status !== 200 || response.body.access !== 'granted') {
  process.exit(1);
}

process.stdout.write('Auth smoke passed\n');
