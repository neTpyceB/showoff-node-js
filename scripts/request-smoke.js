const apiUrl = process.env.API_URL ?? 'http://localhost:3000';

let response = await fetch(`${apiUrl}/events`, {
  body: JSON.stringify({ message: 'created order', userId: 'user-1' }),
  headers: { 'Content-Type': 'application/json' },
  method: 'POST'
});

if (response.status !== 202) {
  throw new Error(`Expected 202 from event publish, received ${response.status}`);
}

const { eventId } = await response.json();

if (!eventId) {
  throw new Error('Missing eventId');
}

async function waitForProjection(path) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const projectionResponse = await fetch(`${apiUrl}${path}`);

    if (projectionResponse.status !== 200) {
      throw new Error(`Expected 200 from ${path}, received ${projectionResponse.status}`);
    }

    const projection = await projectionResponse.json();

    if (projection.length === 1) {
      return projection;
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error(`Projection did not converge: ${path}`);
}

const notifications = await waitForProjection('/notifications/user-1');
const feed = await waitForProjection('/feed/user-1');
const audit = await waitForProjection('/audit');

for (const projection of [notifications, feed, audit]) {
  if (projection[0].eventId !== eventId || projection[0].message !== 'created order' || projection[0].userId !== 'user-1') {
    throw new Error('Unexpected projection payload');
  }
}

response = await fetch(`${apiUrl}/health`);

if (response.status !== 200) {
  throw new Error(`Expected 200 from health, received ${response.status}`);
}

process.stdout.write('Event-driven smoke passed\n');
