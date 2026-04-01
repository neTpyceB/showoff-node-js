#!/usr/bin/env node

import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import { executeCommand } from './command.js';
import { FileManager } from './file-manager.js';

export async function run({
  input = process.stdin,
  output = process.stdout,
  error = process.stderr,
  startDir = process.cwd()
} = {}) {
  const manager = new FileManager(startDir);
  const reader = createInterface({ input, crlfDelay: Infinity });

  for await (const line of reader) {
    try {
      const result = await executeCommand(line, manager);

      if (result !== null) {
        output.write(`${result}\n`);
      }
    } catch (caught) {
      error.write(`${caught.message}\n`);
    }
  }

  reader.close();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await run();
}
