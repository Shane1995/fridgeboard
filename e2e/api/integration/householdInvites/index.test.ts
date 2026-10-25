import { randomUUID } from 'node:crypto';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { handler } from '../../../../apps/functions/src/handlers/households/index.ts';
import { HouseholdRole } from '../../../../apps/functions/src/utils/isHouseholdRole/constants.ts';
import { householdMetaKey } from '../../../../apps/functions/src/utils/keys/householdMetaKey/index.ts';
import { inviteKey } from '../../../../apps/functions/src/utils/keys/inviteKey/index.ts';
import { membershipKey } from '../../../../apps/functions/src/utils/keys/membershipKey/index.ts';
import { profileKey } from '../../../../apps/functions/src/utils/keys/profileKey/index.ts';
import { buildEvent } from '../dynamodbLocal/buildEvent/index.ts';
import { client } from '../dynamodbLocal/client/index.ts';
import { TABLE_NAME } from '../dynamodbLocal/constants.ts';
import { getItem } from '../dynamodbLocal/getItem/index.ts';

vi.mock('../../../../apps/functions/src/utils/ensureEmailIdentity/index.ts', () => ({
  ensureEmailIdentity: vi.fn().mockResolvedValue('created'),
}));

const put = async (Item: Record<string, unknown>): Promise<void> => {
  await client.send(new PutCommand({ TableName: TABLE_NAME, Item }));
};

const seedOwner = async ({ admin = false }: { admin?: boolean } = {}) => {
  const sub = randomUUID();
  await put({ ...profileKey(sub), email: `${sub}@example.com`, canCreateHousehold: true });
  const result = await handler(
    buildEvent({
      claims: admin ? { sub, 'cognito:groups': '[admin]' } : { sub },
      method: 'POST',
      path: '/api/v1/households',
      body: { name: 'Home' },
    }),
  );
  const { id } = JSON.parse(String(result.body));
  return { sub, householdId: String(id), admin };
};

const invite = ({ sub, householdId, email }: { sub: string; householdId: string; email: string }) =>
  handler(
    buildEvent({
      claims: { sub },
      method: 'POST',
      path: `/api/v1/households/${householdId}/invites`,
      pathParameters: { householdId },
      body: { email },
    }),
  );

const reasonOf = (body: string | undefined) => JSON.parse(String(body)).reason;

describe('household invites against DynamoDB Local', () => {
  it('writes a household invite and counts it on the household', async () => {
    const { sub, householdId } = await seedOwner();
    const email = `${randomUUID()}@example.com`;

    const result = await invite({ sub, householdId, email });

    expect(result.statusCode).toBe(201);
    expect(await getItem(inviteKey(email))).toMatchObject({
      type: 'household',
      hhId: householdId,
      invitedBy: sub,
    });
    expect(await getItem(householdMetaKey(householdId))).toMatchObject({
      inviteLimit: 4,
      invitesUsed: 1,
    });
  });

  it('stops an app-invitee household at four invites', async () => {
    const owner = await seedOwner();
    for (let index = 0; index < 4; index += 1) {
      const result = await invite({ ...owner, email: `${randomUUID()}@example.com` });
      expect(result.statusCode).toBe(201);
    }

    const fifth = await invite({ ...owner, email: `${randomUUID()}@example.com` });

    expect(fifth.statusCode).toBe(409);
    expect(reasonOf(fifth.body)).toBe('limit-reached');
    expect(await getItem(householdMetaKey(owner.householdId))).toMatchObject({ invitesUsed: 4 });
  });

  it('leaves an admin household uncapped', async () => {
    const owner = await seedOwner({ admin: true });
    expect(await getItem(householdMetaKey(owner.householdId))).not.toHaveProperty('inviteLimit');

    for (let index = 0; index < 6; index += 1) {
      const result = await invite({ ...owner, email: `${randomUUID()}@example.com` });
      expect(result.statusCode).toBe(201);
    }
  });

  it('lets any member invite, not just the owner', async () => {
    const owner = await seedOwner();
    const memberSub = randomUUID();
    await put({ ...membershipKey(owner.householdId, memberSub), role: HouseholdRole.Member });

    const result = await invite({
      sub: memberSub,
      householdId: owner.householdId,
      email: `${randomUUID()}@example.com`,
    });

    expect(result.statusCode).toBe(201);
    expect(await getItem(householdMetaKey(owner.householdId))).toMatchObject({ invitesUsed: 1 });
  });

  it('refuses a second live invite to the same email and does not use another slot', async () => {
    const owner = await seedOwner();
    const email = `${randomUUID()}@example.com`;
    await invite({ ...owner, email });

    const again = await invite({ ...owner, email });

    expect(again.statusCode).toBe(409);
    expect(reasonOf(again.body)).toBe('already-invited');
    expect(await getItem(householdMetaKey(owner.householdId))).toMatchObject({ invitesUsed: 1 });
  });

  it('replaces an expired invite', async () => {
    const owner = await seedOwner();
    const email = `${randomUUID()}@example.com`;
    await put({
      ...inviteKey(email),
      type: 'household',
      hhId: 'old',
      invitedBy: 'x',
      expiresAt: 1,
      ttl: 1,
    });

    const result = await invite({ ...owner, email });

    expect(result.statusCode).toBe(201);
    expect(await getItem(inviteKey(email))).toMatchObject({ hhId: owner.householdId });
  });

  it('returns 404 to someone who is not a member and writes nothing', async () => {
    const owner = await seedOwner();
    const email = `${randomUUID()}@example.com`;

    const result = await invite({ sub: randomUUID(), householdId: owner.householdId, email });

    expect(result.statusCode).toBe(404);
    expect(await getItem(inviteKey(email))).toBeUndefined();
    expect(await getItem(householdMetaKey(owner.householdId))).toMatchObject({ invitesUsed: 0 });
  });
});
