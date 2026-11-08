import { membershipQuery } from './index.ts';

describe('membershipQuery', () => {
  it('queries GSI1 for the memberships of one user', () => {
    expect(membershipQuery('sub-1')).toEqual({
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :pk',
      ExpressionAttributeValues: { ':pk': 'USER#sub-1' },
    });
  });
});
