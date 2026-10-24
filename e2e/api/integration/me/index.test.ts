import { randomUUID } from 'node:crypto';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { buildEvent } from '../dynamodbLocal/buildEvent/index.ts';
import { client } from '../dynamodbLocal/client/index.ts';
import { TABLE_NAME } from '../dynamodbLocal/constants.ts';
import { handler } from '../../../../apps/functions/src/handlers/me/index.ts';
import { HouseholdRole } from '../../../../apps/functions/src/utils/isHouseholdRole/constants.ts';
import { membershipKey } from '../../../../apps/functions/src/utils/keys/membershipKey/index.ts';
import { profileKey } from '../../../../apps/functions/src/utils/keys/profileKey/index.ts';

const getMe = (sub: string) =>
  handler(buildEvent({ claims: { sub }, method: 'GET', path: '/api/v1/me' }));

describe('me handler against DynamoDB Local', () => {
  it('returns the identity stored on the profile', async () => {
    const sub = randomUUID();
    await client.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          ...profileKey(sub),
          email: 'jess@example.com',
          username: 'jess',
          canCreateHousehold: true,
        },
      }),
    );

    const result = await getMe(sub);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(String(result.body))).toEqual({
      sub,
      email: 'jess@example.com',
      username: 'jess',
      isAdmin: false,
      canCreateHousehold: true,
      hasOnboarding: true,
    });
  });

  it('has no onboarding left once the user has a username and a household', async () => {
    const sub = randomUUID();
    const hhId = randomUUID();
    await client.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: { ...profileKey(sub), email: 'a@x.com', username: 'jess', canCreateHousehold: true },
      }),
    );
    await client.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: { ...membershipKey(hhId, sub), role: HouseholdRole.Owner },
      }),
    );

    expect(JSON.parse(String((await getMe(sub)).body)).hasOnboarding).toBe(false);
  });

  it('returns 404 when the profile does not exist', async () => {
    const result = await getMe(randomUUID());

    expect(result.statusCode).toBe(404);
  });
});
