import {
  householdIdFromKey,
  householdMetaKey,
  inviteKey,
  membershipGsiKey,
  profileKey,
} from './index.ts';

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

  it('builds a household META key', () => {
    expect(householdMetaKey('h1')).toEqual({ PK: 'HH#h1', SK: 'META' });
  });

  it('extracts a household id from a key', () => {
    expect(householdIdFromKey('HH#h1')).toBe('h1');
  });

  it.each(['', 'HH#', 'USER#h1', 'h1'])('returns undefined for %j', (value) => {
    expect(householdIdFromKey(value)).toBeUndefined();
  });

  it.each([undefined, 1, {}])('returns undefined for non-string %j', (value) => {
    expect(householdIdFromKey(value)).toBeUndefined();
  });
});
