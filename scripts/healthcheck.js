import { connectClient } from './ws-client.js';

const baseUrl = process.env.API_URL ?? 'http://127.0.0.1:3000';
const room = `health-${process.pid}`;
const client = await connectClient(baseUrl, room, 'health');

await client.nextEvent();
await client.nextEvent();
await client.close();
