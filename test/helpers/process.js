import { spawn } from 'node:child_process';

export function startProcess(file, env) {
  return spawn(process.execPath, [file], {
    cwd: process.cwd(),
    env: { ...process.env, ...env },
    stdio: 'ignore'
  });
}

export async function stopProcess(processHandle, signal = 'SIGTERM') {
  if (processHandle.exitCode !== null || processHandle.signalCode !== null) {
    return;
  }

  await new Promise((resolve) => {
    processHandle.once('close', resolve);
    processHandle.kill(signal);
  });
}

export async function waitForServer(baseUrl) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/missing`, {
        headers: { Connection: 'close' }
      });

      if (response.status === 404) {
        return;
      }
    } catch {}

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error(`Server did not start: ${baseUrl}`);
}
