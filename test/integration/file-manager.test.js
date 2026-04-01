import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { FileManager } from '../../src/file-manager.js';

async function createWorkspace() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'file-manager-'));

  await fs.mkdir(path.join(root, 'nested', 'deep'), { recursive: true });
  await fs.writeFile(path.join(root, 'alpha.txt'), 'alpha');
  await fs.writeFile(path.join(root, 'nested', 'beta.txt'), 'beta');
  await fs.writeFile(path.join(root, 'nested', 'deep', 'large.bin'), 'x'.repeat(4096));

  return root;
}

test('FileManager supports navigation, file IO, search, and streaming', async () => {
  const root = await createWorkspace();
  const manager = new FileManager(root);

  assert.equal(manager.resolve('nested'), path.join(root, 'nested'));
  assert.equal(await manager.pwd(), root);
  assert.deepEqual(await manager.ls(), ['alpha.txt', 'nested/']);
  assert.equal(await manager.cd('nested'), path.join(root, 'nested'));
  assert.equal(await manager.up(), root);
  assert.equal(await manager.read('alpha.txt'), 'alpha');
  assert.equal(
    await manager.write('notes/output.txt', 'hello'),
    path.join(root, 'notes', 'output.txt')
  );
  assert.equal(await fs.readFile(path.join(root, 'notes', 'output.txt'), 'utf8'), 'hello');
  assert.deepEqual(await manager.find('.txt'), [
    'alpha.txt',
    'nested/beta.txt',
    'notes/output.txt'
  ]);
  assert.equal(
    await manager.stream('nested/deep/large.bin', 'copies/large.bin'),
    4096
  );
  assert.equal(
    await fs.readFile(path.join(root, 'copies', 'large.bin'), 'utf8'),
    'x'.repeat(4096)
  );
});

test('FileManager rejects cd into files', async () => {
  const root = await createWorkspace();
  const manager = new FileManager(root);

  await assert.rejects(() => manager.cd('alpha.txt'), /Not a directory/);
});
