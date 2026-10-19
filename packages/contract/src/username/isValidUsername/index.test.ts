import { isValidUsername } from './index.ts';

const LIMITS = { min: 3, max: 20 };

describe('isValidUsername', () => {
  it.each(['abc', 'Jess_99', 'a'.repeat(20)])('accepts %s', (username) => {
    expect(isValidUsername(username, LIMITS)).toBe(true);
  });

  it.each(['', 'ab', 'a'.repeat(21), 'has space', 'bad-dash'])('rejects %j', (username) => {
    expect(isValidUsername(username, LIMITS)).toBe(false);
  });

  it('applies the limits it is given', () => {
    expect(isValidUsername('ab', { min: 2, max: 4 })).toBe(true);
    expect(isValidUsername('abcde', { min: 2, max: 4 })).toBe(false);
  });
});
