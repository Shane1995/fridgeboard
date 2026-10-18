import { membershipGsiKey } from './index.ts';

describe('membershipGsiKey', () => {
  it('builds a membership GSI key', () => {
    expect(membershipGsiKey('abc')).toEqual({ GSI1PK: 'USER#abc' });
  });
});
