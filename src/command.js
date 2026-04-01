function tokenize(line) {
  const tokens = [];
  let current = '';
  let escaped = false;
  let quoted = false;

  for (const character of line.trim()) {
    if (escaped) {
      current += character;
      escaped = false;
      continue;
    }

    if (character === '\\') {
      escaped = true;
      continue;
    }

    if (character === '"') {
      quoted = !quoted;
      continue;
    }

    if (character === ' ' && !quoted) {
      if (current) {
        tokens.push(current);
        current = '';
      }

      continue;
    }

    current += character;
  }

  if (escaped) {
    current += '\\';
  }

  if (quoted) {
    throw new Error('Unclosed quote');
  }

  if (current) {
    tokens.push(current);
  }

  return tokens;
}

function expectArgs(command, args, size) {
  if (args.length !== size) {
    throw new Error(`Usage: ${command}`);
  }
}

export async function executeCommand(line, manager) {
  const [command, ...args] = tokenize(line);

  if (!command) {
    return null;
  }

  switch (command) {
    case 'pwd':
      expectArgs('pwd', args, 0);
      return manager.pwd();
    case 'ls':
      expectArgs('ls', args, 0);
      return (await manager.ls()).join('\n');
    case 'cd':
      expectArgs('cd <path>', args, 1);
      return manager.cd(args[0]);
    case 'up':
      expectArgs('up', args, 0);
      return manager.up();
    case 'read':
      expectArgs('read <path>', args, 1);
      return manager.read(args[0]);
    case 'write':
      expectArgs('write <path> <content>', args, 2);
      return manager.write(args[0], args[1]);
    case 'find':
      if (args.length !== 1 && args.length !== 2) {
        throw new Error('Usage: find <query> [path]');
      }

      return (await manager.find(args[0], args[1] ?? '.')).join('\n');
    case 'stream':
      expectArgs('stream <source> <destination>', args, 2);
      return String(await manager.stream(args[0], args[1]));
    default:
      throw new Error(`Unknown command: ${command}`);
  }
}

export { tokenize };
