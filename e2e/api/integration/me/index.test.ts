import { randomUUID } from 'node:crypto';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { buildEvent } from '../dynamodbLocal/buildEvent/index.ts';
import { client } from '../dynamodbLocal/client/index.ts';
import { TABLE_NAME } from '../dynamodbLocal/constants.ts';
import { handler } from '../../../../apps/functions/src/handlers/me/index.ts';
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
    });
  });

  it('returns 404 when the profile does not exist', async () => {
    const result = await getMe(randomUUID());

    expect(result.statusCode).toBe(404);
  });
});
