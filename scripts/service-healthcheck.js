const baseUrl = process.env.API_URL ?? `http://127.0.0.1:${process.env.PORT ?? '3001'}`;
const response = await fetch(`${baseUrl}/hello`);

process.exit(response.status === 200 ? 0 : 1);
