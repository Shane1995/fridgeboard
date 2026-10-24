import { randomUUID } from 'node:crypto';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { HouseholdRole } from '../../../../apps/functions/src/utils/isHouseholdRole/constants.ts';
import { buildEvent } from '../dynamodbLocal/buildEvent/index.ts';
import { client } from '../dynamodbLocal/client/index.ts';
import { getItem } from '../dynamodbLocal/getItem/index.ts';
import { TABLE_NAME } from '../dynamodbLocal/constants.ts';
import { householdMetaKey } from '../../../../apps/functions/src/utils/keys/householdMetaKey/index.ts';
import { membershipKey } from '../../../../apps/functions/src/utils/keys/membershipKey/index.ts';
import { ownedHouseholdKey } from '../../../../apps/functions/src/utils/keys/ownedHouseholdKey/index.ts';
import { profileKey } from '../../../../apps/functions/src/utils/keys/profileKey/index.ts';
import { handler } from '../../../../apps/functions/src/handlers/households/index.ts';

const seedProfile = async (sub: string, canCreateHousehold: boolean): Promise<void> => {
  await client.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: { ...profileKey(sub), email: `${sub}@example.com`, canCreateHousehold },
    }),
  );
};

const createHousehold = (sub: string, name = 'Home') =>
  handler(
    buildEvent({
      claims: { sub },
      method: 'POST',
      path: '/api/v1/households',
      body: { name },
    }),
  );

describe('households handler against DynamoDB Local', () => {
  it('creates the household, owner membership and ownership guard in one transaction', async () => {
    const sub = randomUUID();
    await seedProfile(sub, true);

    const result = await createHousehold(sub, 'Linden');

    expect(result.statusCode).toBe(201);
    const { id } = JSON.parse(String(result.body));
    const keys = [householdMetaKey(id), membershipKey(id, sub), ownedHouseholdKey(sub)];
    const items = await Promise.all(keys.map(getItem));
    expect(items[0]).toMatchObject({ name: 'Linden', ownerSub: sub });
    expect(items[1]).toMatchObject({ role: HouseholdRole.Owner });
    expect(items[2]).toMatchObject({ householdId: id });
  });

  it('refuses a user who may not create a household', async () => {
    const sub = randomUUID();
    await seedProfile(sub, false);

    const result = await createHousehold(sub);

    expect(result.statusCode).toBe(403);
    expect(JSON.parse(String(result.body))).toEqual({ reason: 'not-allowed' });
  });

  it('refuses a second household for the same owner', async () => {
    const sub = randomUUID();
    await seedProfile(sub, true);
    await createHousehold(sub);

    const result = await createHousehold(sub);

    expect(result.statusCode).toBe(409);
    expect(JSON.parse(String(result.body))).toEqual({ reason: 'household-exists' });
  });

  it('lets an admin create a household without the canCreateHousehold flag', async () => {
    const sub = randomUUID();
    await seedProfile(sub, false);

    const result = await handler(
      buildEvent({
        claims: { sub, 'cognito:groups': ['admin'] },
        method: 'POST',
        path: '/api/v1/households',
        body: { name: 'Admin home' },
      }),
    );

    expect(result.statusCode).toBe(201);
  });
});

const put = async (Item: Record<string, unknown>): Promise<void> => {
  await client.send(new PutCommand({ TableName: TABLE_NAME, Item }));
};

const list = (sub: string) =>
  handler(buildEvent({ claims: { sub }, method: 'GET', path: '/api/v1/households' }));

describe('households handler: GET against DynamoDB Local', () => {
  it('lists every household the user belongs to through GSI1', async () => {
    const sub = randomUUID();
    const owned = randomUUID();
    const joined = randomUUID();
    await put({ ...householdMetaKey(owned), name: 'Owned' });
    await put({ ...householdMetaKey(joined), name: 'Joined' });
    await put({ ...membershipKey(owned, sub), role: HouseholdRole.Owner });
    await put({ ...membershipKey(joined, sub), role: HouseholdRole.Member });

    const result = await list(sub);

    expect(result.statusCode).toBe(200);
    const { households } = JSON.parse(String(result.body));
    expect(households).toHaveLength(2);
    expect(households).toEqual(
      expect.arrayContaining([
        { id: owned, name: 'Owned', role: HouseholdRole.Owner },
        { id: joined, name: 'Joined', role: HouseholdRole.Member },
      ]),
    );
  });

  it("does not list another user's households", async () => {
    const sub = randomUUID();
    const hhId = randomUUID();
    await put({ ...householdMetaKey(hhId), name: 'Theirs' });
    await put({ ...membershipKey(hhId, randomUUID()), role: HouseholdRole.Owner });

    const { households } = JSON.parse(String((await list(sub)).body));

    expect(households).toEqual([]);
  });
});
