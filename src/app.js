function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(payload));
}

async function readJsonBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  return JSON.parse(Buffer.concat(chunks).toString());
}

export function createHandler(jobService) {
  return async (request, response) => {
    if (request.method === 'POST' && request.url === '/jobs') {
      try {
        const payload = await readJsonBody(request);
        const job = await jobService.enqueueJob(payload);

        sendJson(response, 201, { id: job.id });
      } catch (error) {
        if (error instanceof SyntaxError) {
          sendJson(response, 400, { error: 'Invalid JSON' });
          return;
        }

        sendJson(response, 500, { error: 'Internal server error' });
      }

      return;
    }

    const match = request.url?.match(/^\/jobs\/([^/]+)$/);

    if (request.method === 'GET' && match) {
      const job = await jobService.getJob(match[1]);

      if (!job) {
        sendJson(response, 404, { error: 'Job not found' });
        return;
      }

      sendJson(response, 200, job);
      return;
    }

    sendJson(response, 404, { error: 'Route not found' });
  };
}
