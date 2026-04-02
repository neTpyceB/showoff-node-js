const baseUrl = process.env.API_URL ?? 'http://localhost:3000';
const attempts = Number.parseInt(process.env.ATTEMPTS ?? '30', 10);

async function csvRequest() {
  const response = await fetch(`${baseUrl}/transform/csv-to-ndjson`, {
    method: 'POST',
    headers: {
      Connection: 'close',
      'Content-Type': 'text/csv'
    },
    body: 'name,score\nalice,10\nbob,20\n'
  });

  return {
    body: await response.text(),
    ok: response.ok
  };
}

async function jsonRequest() {
  const response = await fetch(`${baseUrl}/transform/json-to-csv`, {
    method: 'POST',
    headers: {
      Connection: 'close',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify([
      { name: 'alice', score: 10 },
      { name: 'bob', score: 20 }
    ])
  });

  return {
    body: await response.text(),
    ok: response.ok
  };
}

for (let attempt = 0; attempt < attempts; attempt += 1) {
  try {
    const csv = await csvRequest();
    const json = await jsonRequest();

    if (
      csv.ok &&
      json.ok &&
      csv.body === '{"name":"alice","score":"10"}\n{"name":"bob","score":"20"}\n' &&
      json.body === 'name,score\nalice,10\nbob,20\n'
    ) {
      process.stdout.write('Streaming smoke passed\n');
      process.exit(0);
    }
  } catch {}

  await new Promise((resolve) => setTimeout(resolve, 1000));
}

process.exit(1);
