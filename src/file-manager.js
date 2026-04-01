import { createReadStream, createWriteStream, promises as fs } from 'node:fs';
import path from 'node:path';
import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';

async function walk(current, root, query, matches) {
  const entries = await fs.readdir(current, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(current, entry.name);

    if (entry.isDirectory()) {
      await walk(entryPath, root, query, matches);
      continue;
    }

    if (entry.name.includes(query)) {
      matches.push(path.relative(root, entryPath));
    }
  }
}

export class FileManager {
  constructor(startDir) {
    this.cwd = path.resolve(startDir);
  }

  resolve(target = '.') {
    return path.resolve(this.cwd, target);
  }

  async pwd() {
    return this.cwd;
  }

  async ls() {
    const entries = await fs.readdir(this.cwd, { withFileTypes: true });

    return entries
      .map((entry) => `${entry.name}${entry.isDirectory() ? '/' : ''}`)
      .sort((left, right) => left.localeCompare(right));
  }

  async cd(target) {
    const next = this.resolve(target);
    const stats = await fs.stat(next);

    if (!stats.isDirectory()) {
      throw new Error('Not a directory');
    }

    this.cwd = next;
    return this.cwd;
  }

  async up() {
    return this.cd('..');
  }

  async read(target) {
    return fs.readFile(this.resolve(target), 'utf8');
  }

  async write(target, content) {
    const destination = this.resolve(target);

    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(destination, Buffer.from(content, 'utf8'));

    return destination;
  }

  async find(query, base = '.') {
    const root = this.resolve(base);
    const matches = [];

    await walk(root, root, query, matches);

    return matches.sort((left, right) => left.localeCompare(right));
  }

  async stream(source, destination) {
    const from = this.resolve(source);
    const to = this.resolve(destination);
    let bytes = 0;

    await fs.mkdir(path.dirname(to), { recursive: true });
    await pipeline(
      createReadStream(from),
      new Transform({
        transform(chunk, _encoding, callback) {
          bytes += chunk.byteLength;
          callback(null, chunk);
        }
      }),
      createWriteStream(to)
    );

    return bytes;
  }
}
