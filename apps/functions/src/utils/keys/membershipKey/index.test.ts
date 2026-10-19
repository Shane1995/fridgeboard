import { membershipKey } from './index.ts';

describe('membershipKey', () => {
  it('keys the member under the household and indexes it by user', () => {
    expect(membershipKey('hh-1', 'sub-1')).toEqual({
      PK: 'HH#hh-1',
      SK: 'MEMBER#sub-1',
      GSI1PK: 'USER#sub-1',
      GSI1SK: 'HH#hh-1',
    });
  });
});
