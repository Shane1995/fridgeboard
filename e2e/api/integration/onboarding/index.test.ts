import { randomUUID } from 'node:crypto';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { buildEvent } from '../dynamodbLocal/buildEvent/index.ts';
import { client } from '../dynamodbLocal/client/index.ts';
import { TABLE_NAME } from '../dynamodbLocal/constants.ts';
import { OnboardingSectionId } from '../../../../apps/functions/src/utils/buildOnboarding/constants.ts';
import { handler } from '../../../../apps/functions/src/handlers/onboarding/index.ts';
import { HouseholdRole } from '../../../../apps/functions/src/utils/isHouseholdRole/constants.ts';
import { householdMetaKey } from '../../../../apps/functions/src/utils/keys/householdMetaKey/index.ts';
import { membershipKey } from '../../../../apps/functions/src/utils/keys/membershipKey/index.ts';
import { profileKey } from '../../../../apps/functions/src/utils/keys/profileKey/index.ts';

const put = async (Item: Record<string, unknown>): Promise<void> => {
  await client.send(new PutCommand({ TableName: TABLE_NAME, Item }));
};

const getSections = async (sub: string) => {
  const result = await handler(
    buildEvent({ claims: { sub }, method: 'GET', path: '/api/v1/me/onboarding' }),
  );
  return JSON.parse(String(result.body)).sections;
};

describe('onboarding handler against DynamoDB Local', () => {
  it('asks a new creator for a username and a household', async () => {
    const sub = randomUUID();
    await put({ ...profileKey(sub), email: 'a@x.com', canCreateHousehold: true });

    expect(await getSections(sub)).toEqual([
      { id: OnboardingSectionId.Username },
      { id: OnboardingSectionId.Household },
    ]);
  });

  it('returns nothing once the creator has a username and a household', async () => {
    const sub = randomUUID();
    const hhId = randomUUID();
    await put({ ...profileKey(sub), email: 'a@x.com', username: 'jess', canCreateHousehold: true });
    await put({ ...householdMetaKey(hhId), name: 'Home' });
    await put({ ...membershipKey(hhId, sub), role: HouseholdRole.Owner });

    expect(await getSections(sub)).toEqual([]);
  });

  it('tells an uninvited user with no household to ask for an invite', async () => {
    const sub = randomUUID();
    await put({ ...profileKey(sub), email: 'a@x.com', canCreateHousehold: false });

    expect(await getSections(sub)).toContainEqual({ id: OnboardingSectionId.NeedsInvite });
  });

  it('returns 404 when the profile does not exist', async () => {
    const result = await handler(
      buildEvent({ claims: { sub: randomUUID() }, method: 'GET', path: '/api/v1/me/onboarding' }),
    );

    expect(result.statusCode).toBe(404);
  });
});
