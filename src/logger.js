export function formatLog(entry) {
  return `${JSON.stringify(entry)}\n`;
}

export function createLogger(write = process.stdout.write.bind(process.stdout), now = () => new Date().toISOString()) {
  return (entry) => {
    write(formatLog({ ...entry, time: now() }));
  };
}
