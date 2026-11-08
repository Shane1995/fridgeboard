import { profileKey } from './index.ts';

describe('profileKey', () => {
  it('builds a profile key', () => {
    expect(profileKey('abc')).toEqual({ PK: 'USER#abc', SK: 'PROFILE' });
  });
});
