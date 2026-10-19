import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { BUNDLE_FILE } from './constants.ts';

const mocks = vi.hoisted(() => {
  const fs = process.getBuiltinModule('node:fs');
  const os = process.getBuiltinModule('node:os');
  const path = process.getBuiltinModule('node:path');
  return { outDir: fs.mkdtempSync(path.join(os.tmpdir(), 'smoke-')) };
});

vi.mock('../build/constants.ts', () => ({ OUT_DIR: mocks.outDir }));

const writeBundle = (name: string, source: string) => {
  mkdirSync(join(mocks.outDir, name), { recursive: true });
  writeFileSync(join(mocks.outDir, name, BUNDLE_FILE), source);
};

describe('smoke script', () => {
  beforeEach(() => {
    vi.resetModules();
    rmSync(mocks.outDir, { recursive: true, force: true });
    mkdirSync(mocks.outDir, { recursive: true });
    Reflect.set(globalThis, '__smokeLoaded', []);
  });
  afterAll(() => {
    rmSync(mocks.outDir, { recursive: true, force: true });
    Reflect.deleteProperty(globalThis, '__smokeLoaded');
  });

  it('imports every built handler bundle', async () => {
    writeBundle('auth', `globalThis.__smokeLoaded.push('auth');`);
    writeBundle('me', `globalThis.__smokeLoaded.push('me');`);

    await import('./index.ts');

    expect(Reflect.get(globalThis, '__smokeLoaded').toSorted()).toEqual(['auth', 'me']);
  });

  it('fails when a bundle throws on load', async () => {
    writeBundle('broken', `throw new Error('broken bundle');`);

    await expect(import('./index.ts')).rejects.toThrow('broken bundle');
  });

  it('ignores files that are not bundle directories', async () => {
    writeFileSync(join(mocks.outDir, 'stray.txt'), 'x');
    writeBundle('billing', `globalThis.__smokeLoaded.push('billing');`);

    await import('./index.ts');

    expect(Reflect.get(globalThis, '__smokeLoaded')).toEqual(['billing']);
  });
});
