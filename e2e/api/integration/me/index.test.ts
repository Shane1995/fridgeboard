import { randomUUID } from 'node:crypto';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { buildEvent } from '../dynamodbLocal/buildEvent/index.ts';
import { client } from '../dynamodbLocal/client/index.ts';
import { TABLE_NAME } from '../dynamodbLocal/constants.ts';
import { householdMetaKey } from '../../../../apps/functions/src/utils/keys/householdMetaKey/index.ts';
import { membershipKey } from '../../../../apps/functions/src/utils/keys/membershipKey/index.ts';
import { profileKey } from '../../../../apps/functions/src/utils/keys/profileKey/index.ts';
import { handler } from '../../../../apps/functions/src/handlers/me/index.ts';

const put = async (Item: Record<string, unknown>): Promise<void> => {
  await client.send(new PutCommand({ TableName: TABLE_NAME, Item }));
};

const getMe = (sub: string) =>
  handler(buildEvent({ claims: { sub }, method: 'GET', path: '/api/v1/me' }));

describe('me handler against DynamoDB Local', () => {
  it('lists every household the user belongs to through GSI1', async () => {
    const sub = randomUUID();
    const owned = randomUUID();
    const joined = randomUUID();
    await put({ ...profileKey(sub), email: 'jess@example.com', username: 'jess' });
    await put({ ...householdMetaKey(owned), name: 'Owned' });
    await put({ ...householdMetaKey(joined), name: 'Joined' });
    await put({ ...membershipKey(owned, sub), role: 'owner' });
    await put({ ...membershipKey(joined, sub), role: 'member' });

    const result = await getMe(sub);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(String(result.body));
    expect(body.households).toHaveLength(2);
    expect(body.households).toEqual(
      expect.arrayContaining([
        { id: owned, name: 'Owned', role: 'owner' },
        { id: joined, name: 'Joined', role: 'member' },
      ]),
    );
    expect(body.username).toBe('jess');
  });

  it("does not list another user's households", async () => {
    const sub = randomUUID();
    const other = randomUUID();
    const hhId = randomUUID();
    await put({ ...profileKey(sub), email: 'jess@example.com' });
    await put({ ...householdMetaKey(hhId), name: 'Theirs' });
    await put({ ...membershipKey(hhId, other), role: 'owner' });

    const body = JSON.parse(String((await getMe(sub)).body));

    expect(body.households).toEqual([]);
  });

  it('returns 404 when the profile does not exist', async () => {
    const result = await getMe(randomUUID());

    expect(result.statusCode).toBe(404);
  });
});
