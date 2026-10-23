import { stripUnknownFlags } from '../../../../packages/contract/src/configuration/stripUnknownFlags/index.ts';

describe('stripUnknownFlags', () => {
  it('drops flag names that are not known', () => {
    expect(stripUnknownFlags({ version: 1, featureFlags: { A: true, B: false } }, ['A'])).toEqual({
      version: 1,
      featureFlags: { A: true },
    });
  });

  it.each([
    ['null', null],
    ['a string', 'x'],
    ['an object without flags', { version: 1 }],
    ['null flags', { featureFlags: null }],
    ['array flags', { featureFlags: [] }],
    ['string flags', { featureFlags: 'x' }],
  ])('returns %s unchanged', (_name, input) => {
    expect(stripUnknownFlags(input, ['A'])).toBe(input);
  });
});
