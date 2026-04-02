export function mapError(error) {
  if (error?.code === 'CSV_RECORD_INCONSISTENT_COLUMNS' || error?.code === 'CSV_INVALID_CLOSING_QUOTE') {
    return { status: 400, message: 'Invalid CSV' };
  }

  if (error?.message?.startsWith('Parser cannot parse input')) {
    return { status: 400, message: 'Invalid JSON' };
  }

  if (error?.message?.startsWith('Top-level object should be an array')) {
    return { status: 400, message: 'Invalid JSON' };
  }

  return { status: 500, message: 'Internal server error' };
}

export function sendJsonError(response, status, message) {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json');
  response.end(JSON.stringify({ error: message }));
}
