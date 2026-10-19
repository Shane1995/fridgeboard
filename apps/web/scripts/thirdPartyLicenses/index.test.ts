import { MISSING_LICENSE_TEXT, OUTPUT_FILE, SHIPPED_DEV_PACKAGES } from './constants.ts';

const mocks = vi.hoisted(() => ({
  execFileSync: vi.fn(),
  readdirSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

vi.mock('node:child_process', () => ({ execFileSync: mocks.execFileSync }));
vi.mock('node:fs', () => ({
  readdirSync: mocks.readdirSync,
  readFileSync: mocks.readFileSync,
  writeFileSync: mocks.writeFileSync,
}));

const prod = {
  MIT: [{ name: 'react', versions: ['19.0.0'], paths: ['/pkgs/react'], license: 'MIT' }],
  'OFL-1.1': [
    {
      name: '@fontsource/caveat',
      versions: ['5.0.0'],
      paths: ['/pkgs/caveat'],
      license: 'OFL-1.1',
      homepage: 'https://fonts.example',
    },
  ],
};

const all = {
  ...prod,
  MIT: [
    ...prod.MIT,
    { name: SHIPPED_DEV_PACKAGES[0], versions: ['4.0.0'], paths: ['/pkgs/tw'], license: 'MIT' },
    { name: 'vitest', versions: ['5.0.0'], paths: ['/pkgs/vitest'], license: 'MIT' },
  ],
};

const runScript = async () => {
  vi.resetModules();
  await import('./index.ts');
};

const writtenNotices = (): string => mocks.writeFileSync.mock.calls[0]?.[1];

describe('thirdPartyLicenses script', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    mocks.execFileSync.mockImplementation((_command: string, args: string[]) =>
      JSON.stringify(args.includes('--prod') ? prod : all),
    );
    mocks.readdirSync.mockImplementation((path: string) =>
      path === '/pkgs/caveat' ? ['package.json'] : ['package.json', 'LICENSE.md'],
    );
    mocks.readFileSync.mockImplementation((path: string) => `licence text of ${path}`);
  });
  afterEach(() => vi.restoreAllMocks());

  it('asks pnpm for production and full licence lists', async () => {
    await runScript();

    expect(mocks.execFileSync.mock.calls.map(([command, args]) => [command, args])).toEqual([
      ['pnpm', ['licenses', 'list', '--json', '--prod']],
      ['pnpm', ['licenses', 'list', '--json']],
    ]);
  });

  it('writes notices for production and shipped dev packages only', async () => {
    await runScript();

    expect(mocks.writeFileSync).toHaveBeenCalledWith(OUTPUT_FILE, expect.any(String));
    expect(writtenNotices()).toContain('react@19.0.0 (MIT)');
    expect(writtenNotices()).toContain(`${SHIPPED_DEV_PACKAGES[0]}@4.0.0 (MIT)`);
    expect(writtenNotices()).not.toContain('vitest');
  });

  it('includes the text of the licence file found in the package', async () => {
    await runScript();

    expect(writtenNotices()).toContain('licence text of /pkgs/react/LICENSE.md');
  });

  it('falls back to a placeholder when the package has no licence file', async () => {
    await runScript();

    expect(writtenNotices()).toContain(MISSING_LICENSE_TEXT);
  });

  it('reports how many notices were written', async () => {
    await runScript();

    expect(console.log).toHaveBeenCalledWith(`Wrote 3 third-party notices to ${OUTPUT_FILE}`);
  });
});
