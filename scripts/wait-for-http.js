const url = process.argv[2];
const attempts = Number.parseInt(process.argv[3] ?? '30', 10);
const delayMs = Number.parseInt(process.argv[4] ?? '1000', 10);

if (!url) {
  process.stderr.write('Usage: node scripts/wait-for-http.js <url> [attempts] [delayMs]\n');
  process.exit(1);
}

for (let attempt = 0; attempt < attempts; attempt += 1) {
  try {
    await fetch(url);
    process.stdout.write(`Ready: ${url}\n`);
    process.exit(0);
  } catch {}

  await new Promise((resolve) => setTimeout(resolve, delayMs));
}

process.stderr.write(`Timed out waiting for ${url}\n`);
process.exit(1);
