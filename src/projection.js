export function listKey(serviceName, userId) {
  if (serviceName === 'audit') {
    return 'audit';
  }

  return `${serviceName}:${userId}`;
}

export function serializeEvent(event) {
  return JSON.stringify({
    eventId: event.eventId,
    message: event.message,
    userId: event.userId
  });
}
