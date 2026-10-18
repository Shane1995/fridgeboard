import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { findReexports } from './index.ts';

describe('findReexports', () => {
  const root = mkdtempSync(join(tmpdir(), 'reexports-'));

  const write = (relative: string, content: string): string => {
    const path = join(root, relative);
    mkdirSync(join(path, '..'), { recursive: true });
    writeFileSync(path, content);
    return path;
  };

  afterAll(() => rmSync(root, { recursive: true, force: true }));

  it.each([
    ['export * from', "export * from './a.ts';\n"],
    ['export * as x from', "export * as x from './a.ts';\n"],
    ['export type {..} from', "export type { A } from './a.ts';\n"],
    ['named export from', "export { a } from './a.ts';\n"],
    ['multi-line braces', "export {\n  a,\n  b,\n} from './a.ts';\n"],
  ])('flags %s', (name, content) => {
    const path = write(`flag/${name.replace(/\W+/g, '-')}.ts`, content);

    expect(findReexports([join(root, 'flag')])).toContain(path);
  });

  it('flags tsx files', () => {
    const path = write('tsx/view.tsx', "export * from './a.ts';\n");

    expect(findReexports([join(root, 'tsx')])).toEqual([path]);
  });

  it('returns nothing for a clean file', () => {
    write('clean/index.ts', "import { a } from './a.ts';\nexport const b = a;\nexport { c };\n");

    expect(findReexports([join(root, 'clean')])).toEqual([]);
  });

  it('skips routeTree.gen.ts', () => {
    write('gen/routeTree.gen.ts', "export * from './a.ts';\n");

    expect(findReexports([join(root, 'gen')])).toEqual([]);
  });

  it.each(['node_modules', 'dist', 'coverage'])('skips %s directories', (directory) => {
    write(`skip/${directory}/index.ts`, "export * from './a.ts';\n");

    expect(findReexports([join(root, 'skip')])).toEqual([]);
  });

  it('ignores non-source files', () => {
    write('other/readme.md', "export * from './a.ts';\n");

    expect(findReexports([join(root, 'other')])).toEqual([]);
  });
});
