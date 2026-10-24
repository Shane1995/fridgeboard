import { isValidUsername } from './index.ts';

const LIMITS = { min: 3, max: 20 };

describe('isValidUsername', () => {
  it.each(['abc', 'jess_1', 'A_B_C', 'a'.repeat(20)])('accepts %s', (username) => {
    expect(isValidUsername(username, LIMITS)).toBe(true);
  });

  it.each(['ab', 'a'.repeat(21), '', 'has space', 'dash-ed', 'émile', 'a.b'])(
    'rejects %s',
    (username) => {
      expect(isValidUsername(username, LIMITS)).toBe(false);
    },
  );

  it('uses the limits it is given', () => {
    expect(isValidUsername('ab', { min: 2, max: 4 })).toBe(true);
    expect(isValidUsername('abcde', { min: 2, max: 4 })).toBe(false);
  });
});
