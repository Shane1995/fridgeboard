import { inviteKey, membershipGsiKey, profileKey } from './index.ts';

describe('keys', () => {
  it('builds a normalised invite key', () => {
    expect(inviteKey(' Jess@Example.com')).toEqual({
      PK: 'INVITE#jess@example.com',
      SK: 'INVITE',
    });
  });

  it('builds a profile key', () => {
    expect(profileKey('abc')).toEqual({ PK: 'USER#abc', SK: 'PROFILE' });
  });

  it('builds a membership GSI key', () => {
    expect(membershipGsiKey('abc')).toEqual({ GSI1PK: 'USER#abc' });
  });
});
