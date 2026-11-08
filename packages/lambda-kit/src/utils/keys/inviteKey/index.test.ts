import { inviteKey } from './index.ts';

describe('inviteKey', () => {
  it('builds a normalised invite key', () => {
    expect(inviteKey(' Jess@Example.com')).toEqual({
      PK: 'INVITE#jess@example.com',
      SK: 'INVITE',
    });
  });
});
