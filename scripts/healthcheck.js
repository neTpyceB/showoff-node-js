const baseUrl = process.env.API_URL ?? 'http://127.0.0.1:3000';
const response = await fetch(`${baseUrl}/jobs/missing`);

process.exit(response.status === 404 ? 0 : 1);
