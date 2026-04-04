const authUrl = process.env.AUTH_URL ?? 'http://localhost:3000';
const userUrl = process.env.USER_URL ?? 'http://localhost:3001';

let response = await fetch(`${authUrl}/register`, {
  body: JSON.stringify({ email: 'user@example.com', password: 'secret' }),
  headers: { 'Content-Type': 'application/json' },
  method: 'POST'
});

if (response.status !== 201) {
  throw new Error(`Expected 201 from register, received ${response.status}`);
}

let payload = await response.json();

if (payload.id !== 1 || payload.email !== 'user@example.com') {
  throw new Error('Unexpected register response');
}

response = await fetch(`${authUrl}/login`, {
  body: JSON.stringify({ email: 'user@example.com', password: 'secret' }),
  headers: { 'Content-Type': 'application/json' },
  method: 'POST'
});

if (response.status !== 200) {
  throw new Error(`Expected 200 from login, received ${response.status}`);
}

payload = await response.json();

if (!payload.token) {
  throw new Error('Missing token');
}

response = await fetch(`${userUrl}/users/me`, {
  headers: { Authorization: `Bearer ${payload.token}` }
});

if (response.status !== 200) {
  throw new Error(`Expected 200 from /users/me, received ${response.status}`);
}

let user = await response.json();

if (user.id !== 1 || user.email !== 'user@example.com') {
  throw new Error('Unexpected user response');
}

response = await fetch(`${userUrl}/users/me/payments`, {
  body: JSON.stringify({ amount: 25 }),
  headers: {
    Authorization: `Bearer ${payload.token}`,
    'Content-Type': 'application/json'
  },
  method: 'POST'
});

if (response.status !== 201) {
  throw new Error(`Expected 201 from payment, received ${response.status}`);
}

user = await response.json();

if (user.id !== 1 || user.userId !== 1 || user.amount !== 25 || user.status !== 'approved') {
  throw new Error('Unexpected payment response');
}

process.stdout.write('Multi-service smoke passed\n');
