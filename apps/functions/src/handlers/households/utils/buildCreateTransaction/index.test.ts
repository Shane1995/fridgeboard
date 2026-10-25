import { buildCreateTransaction } from './index.ts';
import { HouseholdRole } from '../../../../utils/isHouseholdRole/constants.ts';

const params = {
  TableName: 'fridgeboard',
  id: 'hh-1',
  sub: 'sub-1',
  name: 'Home',
  isAdmin: false,
  now: '2026-10-19T00:00:00.000Z',
};

describe('buildCreateTransaction', () => {
  it('requires canCreateHousehold on the caller profile', () => {
    expect(buildCreateTransaction(params)[0]?.ConditionCheck).toEqual({
      TableName: 'fridgeboard',
      Key: { PK: 'USER#sub-1', SK: 'PROFILE' },
      ConditionExpression: 'attribute_exists(PK) AND canCreateHousehold = :allowed',
      ExpressionAttributeValues: { ':allowed': true },
    });
  });

  it('only requires an existing profile for an admin', () => {
    expect(buildCreateTransaction({ ...params, isAdmin: true })[0]?.ConditionCheck).toEqual({
      TableName: 'fridgeboard',
      Key: { PK: 'USER#sub-1', SK: 'PROFILE' },
      ConditionExpression: 'attribute_exists(PK)',
    });
  });

  it('writes the household, the owner membership and the one-owned guard', () => {
    const items = buildCreateTransaction(params);

    expect(items).toHaveLength(4);
    expect(items[1]?.Put?.Item).toEqual({
      PK: 'HH#hh-1',
      SK: 'META',
      name: 'Home',
      ownerSub: 'sub-1',
      createdAt: params.now,
      inviteLimit: 4,
      invitesUsed: 0,
    });
    expect(items[2]?.Put?.Item).toMatchObject({
      PK: 'HH#hh-1',
      SK: 'MEMBER#sub-1',
      role: HouseholdRole.Owner,
      joinedAt: params.now,
    });
    expect(items[3]?.Put?.Item).toEqual({
      PK: 'USER#sub-1',
      SK: 'OWNED_HOUSEHOLD',
      householdId: 'hh-1',
    });
  });

  it('leaves an admin household uncapped', () => {
    const item = buildCreateTransaction({ ...params, isAdmin: true })[1]?.Put?.Item;

    expect(item).toEqual({
      PK: 'HH#hh-1',
      SK: 'META',
      name: 'Home',
      ownerSub: 'sub-1',
      createdAt: params.now,
      invitesUsed: 0,
    });
  });
});
