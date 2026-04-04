async function readBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  return chunks.length === 0 ? null : Buffer.concat(chunks).toString();
}

export function createUpstreamHandler(service) {
  return async (request, response) => {
    const url = new URL(request.url, 'http://localhost');
    const body = request.method === 'GET' || request.method === 'HEAD' ? null : await readBody(request);

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(
      JSON.stringify({
        body,
        method: request.method,
        path: url.pathname,
        service
      })
    );
  };
}
