import test from 'node:test';
import assert from 'node:assert/strict';
import { executeCommand, tokenize } from '../../src/command.js';

test('tokenize preserves quoted segments', () => {
  assert.deepEqual(tokenize('write "notes file.txt" "hello world"'), [
    'write',
    'notes file.txt',
    'hello world'
  ]);
});

test('tokenize rejects unclosed quotes', () => {
  assert.throws(() => tokenize('read "broken'), /Unclosed quote/);
});

test('tokenize handles escapes', () => {
  assert.deepEqual(tokenize('write notes\\ file.txt hello\\ world'), [
    'write',
    'notes file.txt',
    'hello world'
  ]);
  assert.deepEqual(tokenize('write path trailing\\'), ['write', 'path', 'trailing\\']);
});

test('executeCommand handles each supported command', async () => {
  const calls = [];
  const manager = {
    pwd: async () => '/tmp/work',
    ls: async () => ['a.txt', 'nested/'],
    cd: async (target) => {
      calls.push(['cd', target]);
      return '/tmp/work/nested';
    },
    up: async () => '/tmp',
    read: async (target) => {
      calls.push(['read', target]);
      return 'content';
    },
    write: async (target, content) => {
      calls.push(['write', target, content]);
      return `/tmp/work/${target}`;
    },
    find: async (query, base) => {
      calls.push(['find', query, base]);
      return ['match.txt'];
    },
    stream: async (source, destination) => {
      calls.push(['stream', source, destination]);
      return 128;
    }
  };

  assert.equal(await executeCommand('pwd', manager), '/tmp/work');
  assert.equal(await executeCommand('ls', manager), 'a.txt\nnested/');
  assert.equal(await executeCommand('cd nested', manager), '/tmp/work/nested');
  assert.equal(await executeCommand('up', manager), '/tmp');
  assert.equal(await executeCommand('read file.txt', manager), 'content');
  assert.equal(
    await executeCommand('write file.txt "hello world"', manager),
    '/tmp/work/file.txt'
  );
  assert.equal(await executeCommand('find match', manager), 'match.txt');
  assert.equal(await executeCommand('find match nested', manager), 'match.txt');
  assert.equal(await executeCommand('stream source.txt target.txt', manager), '128');
  assert.equal(await executeCommand('   ', manager), null);
  assert.deepEqual(calls, [
    ['cd', 'nested'],
    ['read', 'file.txt'],
    ['write', 'file.txt', 'hello world'],
    ['find', 'match', '.'],
    ['find', 'match', 'nested'],
    ['stream', 'source.txt', 'target.txt']
  ]);
});

test('executeCommand validates usage and command names', async () => {
  const manager = {};

  await assert.rejects(() => executeCommand('pwd extra', manager), /Usage: pwd/);
  await assert.rejects(() => executeCommand('find', manager), /Usage: find <query> \[path\]/);
  await assert.rejects(() => executeCommand('unknown', manager), /Unknown command: unknown/);
});
