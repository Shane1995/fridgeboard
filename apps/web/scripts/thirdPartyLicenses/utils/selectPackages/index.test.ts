import { selectPackages } from '.';
import type { PnpmLicenses } from '../../types.ts';

const prod: PnpmLicenses = {
  MIT: [{ name: 'react', versions: ['19.0.0'], paths: ['/r'], license: 'MIT' }],
  'OFL-1.1': [
    { name: '@fontsource/caveat', versions: ['5.0.0'], paths: ['/c'], license: 'OFL-1.1' },
  ],
};

const all: PnpmLicenses = {
  ...prod,
  MIT: [
    ...(prod.MIT ?? []),
    { name: 'tailwindcss', versions: ['4.0.0'], paths: ['/t'], license: 'MIT' },
    { name: 'vitest', versions: ['5.0.0'], paths: ['/v'], license: 'MIT' },
  ],
};

describe('selectPackages', () => {
  it('includes production dependencies sorted by name', () => {
    const names = selectPackages(prod, all, []).map((p) => p.name);
    expect(names).toEqual(['@fontsource/caveat', 'react']);
  });

  it('adds only the dev dependencies that ship', () => {
    const names = selectPackages(prod, all, ['tailwindcss']).map((p) => p.name);
    expect(names).toEqual(['@fontsource/caveat', 'react', 'tailwindcss']);
  });

  it('lists each installed version once with its own path', () => {
    const twoVersions: PnpmLicenses = {
      MIT: [{ name: 'clsx', versions: ['1.0.0', '2.0.0'], paths: ['/a', '/b'], license: 'MIT' }],
    };
    const result = selectPackages(twoVersions, twoVersions, ['clsx']);
    expect(result).toEqual([
      { name: 'clsx', version: '1.0.0', license: 'MIT', path: '/a' },
      { name: 'clsx', version: '2.0.0', license: 'MIT', path: '/b' },
    ]);
  });
});
