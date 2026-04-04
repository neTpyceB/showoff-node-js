const port = process.env.PORT ?? '3000';
const response = await fetch(`http://127.0.0.1:${port}/missing`);

if (response.status !== 404) {
  throw new Error(`Expected 404, received ${response.status}`);
}
