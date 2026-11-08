import { hasKeys } from './index.ts';

describe('hasKeys', () => {
  it('accepts an item with string PK and SK', () => {
    expect(hasKeys({ PK: 'USER#u1', SK: 'PROFILE' })).toBe(true);
  });

  it('rejects an item missing a string key', () => {
    expect(hasKeys({ PK: 'USER#u1' })).toBe(false);
    expect(hasKeys({ PK: 1, SK: 'PROFILE' })).toBe(false);
  });
});
