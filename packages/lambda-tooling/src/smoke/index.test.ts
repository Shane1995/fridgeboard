import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { BUNDLE_FILE } from './constants.ts';

describe('lambda-smoke', () => {
  let dir = '';

  beforeEach(() => {
    vi.resetModules();
    dir = mkdtempSync(join(tmpdir(), 'smoke-'));
    vi.spyOn(process, 'cwd').mockReturnValue(dir);
    mkdirSync(join(dir, 'dist'), { recursive: true });
    Reflect.set(globalThis, '__smokeLoaded', 0);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    rmSync(dir, { recursive: true, force: true });
  });
  afterAll(() => {
    Reflect.deleteProperty(globalThis, '__smokeLoaded');
  });

  it('imports the built bundle', async () => {
    writeFileSync(join(dir, BUNDLE_FILE), `globalThis.__smokeLoaded = 1;`);

    await import('./index.ts');

    expect(Reflect.get(globalThis, '__smokeLoaded')).toBe(1);
  });

  it('fails when the bundle throws on load', async () => {
    writeFileSync(join(dir, BUNDLE_FILE), `throw new Error('broken bundle');`);

    await expect(import('./index.ts')).rejects.toThrow('broken bundle');
  });

  it('fails when the bundle has not been built', async () => {
    await expect(import('./index.ts')).rejects.toThrow();
  });
});
