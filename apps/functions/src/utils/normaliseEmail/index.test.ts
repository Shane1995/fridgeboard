import { normaliseEmail } from './index.ts';

describe('normaliseEmail', () => {
  it('trims and lowercases', () => {
    expect(normaliseEmail(' Jess@Example.COM ')).toBe('jess@example.com');
  });
});
