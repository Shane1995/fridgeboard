import { randomUUID } from 'node:crypto';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { buildEvent } from '../dynamodbLocal/buildEvent/index.ts';
import { client } from '../dynamodbLocal/client/index.ts';
import { TABLE_NAME } from '../dynamodbLocal/constants.ts';
import { handler } from '../../../../apps/functions/src/handlers/myHouseholds/index.ts';
import { HouseholdRole } from '../../../../apps/functions/src/utils/isHouseholdRole/constants.ts';
import { householdMetaKey } from '../../../../apps/functions/src/utils/keys/householdMetaKey/index.ts';
import { membershipKey } from '../../../../apps/functions/src/utils/keys/membershipKey/index.ts';

const put = async (Item: Record<string, unknown>): Promise<void> => {
  await client.send(new PutCommand({ TableName: TABLE_NAME, Item }));
};

const list = (sub: string) =>
  handler(buildEvent({ claims: { sub }, method: 'GET', path: '/api/v1/households' }));

describe('myHouseholds handler against DynamoDB Local', () => {
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
