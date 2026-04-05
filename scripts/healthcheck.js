const port = process.env.PORT ?? '3000';
const response = await fetch(`http://127.0.0.1:${port}/health`);

if (response.status !== 200) {
  throw new Error(`Expected 200, received ${response.status}`);
}
