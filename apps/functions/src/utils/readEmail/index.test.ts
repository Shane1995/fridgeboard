import { readEmail } from './index.ts';

describe('readEmail', () => {
  it('trims and lowercases a valid address', () => {
    expect(readEmail('  Jess@Example.COM ')).toBe('jess@example.com');
  });

  it.each([
    undefined,
    7,
    null,
    '',
    '   ',
    'jess',
    'jess@',
    '@example.com',
    'jess@example',
    'a b@c.d',
  ])('rejects %j', (value) => {
    expect(readEmail(value)).toBeUndefined();
  });

  it('rejects an address longer than 254 characters', () => {
    expect(readEmail(`${'a'.repeat(250)}@x.co`)).toBeUndefined();
  });
});
