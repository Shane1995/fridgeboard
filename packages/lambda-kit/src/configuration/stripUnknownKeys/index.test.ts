import { stripUnknownKeys } from './index.ts';

describe('stripUnknownKeys', () => {
  it('drops keys of the section that are not known', () => {
    expect(stripUnknownKeys({ version: 1, settings: { a: 1, b: 2 } }, 'settings', ['a'])).toEqual({
      version: 1,
      settings: { a: 1 },
    });
  });

  it.each([
    ['null', null],
    ['a string', 'x'],
    ['an object without the section', { version: 1 }],
    ['a null section', { settings: null }],
    ['an array section', { settings: [] }],
    ['a string section', { settings: 'x' }],
  ])('returns %s unchanged', (_name, input) => {
    expect(stripUnknownKeys(input, 'settings', ['a'])).toBe(input);
  });
});
