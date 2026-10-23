import { randomUUID } from 'node:crypto';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { DEFAULT_LAMBDA_CONFIGURATION } from '@fridgeboard/contract/configuration/lambda/constants';
import { buildEvent } from '../../../test/dynamodbLocal/buildEvent/index.ts';
import { client } from '../../../test/dynamodbLocal/client/index.ts';
import { getItem } from '../../../test/dynamodbLocal/getItem/index.ts';
import { TABLE_NAME } from '../../../test/dynamodbLocal/constants.ts';
import { profileKey } from '../../utils/keys/profileKey/index.ts';
import { usernameKey } from '../../utils/keys/usernameKey/index.ts';
import { handler } from './index.ts';

vi.mock('../../configuration/index.ts', () => ({
  getConfiguration: async () => DEFAULT_LAMBDA_CONFIGURATION,
}));

const seedProfile = async (sub: string): Promise<void> => {
  await client.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: { ...profileKey(sub), email: `${sub}@example.com` },
    }),
  );
};

const putUsername = (sub: string, username: string) =>
  handler(
    buildEvent({ claims: { sub }, method: 'PUT', path: '/api/v1/me/username', body: { username } }),
  );

describe('username handler against DynamoDB Local', () => {
  it('claims a username for a profile', async () => {
    const sub = randomUUID();
    const username = `u${sub.slice(0, 8)}`;
    await seedProfile(sub);

    const result = await putUsername(sub, username);

    expect(result.statusCode).toBe(200);
    const claim = await getItem(usernameKey(username));
    expect(claim?.sub).toBe(sub);
    const profile = await getItem(profileKey(sub));
    expect(profile?.username).toBe(username);
  });

  it('accepts the same user claiming the same username again (reserved word #sub regression)', async () => {
    const sub = randomUUID();
    const username = `u${sub.slice(0, 8)}`;
    await seedProfile(sub);
    await putUsername(sub, username);

    const result = await putUsername(sub, username);

    expect(result.statusCode).toBe(200);
  });

  it('rejects a username another user holds', async () => {
    const first = randomUUID();
    const second = randomUUID();
    const username = `u${first.slice(0, 8)}`;
    await seedProfile(first);
    await seedProfile(second);
    await putUsername(first, username);

    const result = await putUsername(second, username);

    expect(result.statusCode).toBe(409);
    expect(JSON.parse(String(result.body))).toEqual({ reason: 'username-taken' });
  });

  it('rejects a second username for a user who already has one', async () => {
    const sub = randomUUID();
    await seedProfile(sub);
    await putUsername(sub, `a${sub.slice(0, 8)}`);

    const result = await putUsername(sub, `b${sub.slice(0, 8)}`);

    expect(result.statusCode).toBe(409);
    expect(JSON.parse(String(result.body))).toEqual({ reason: 'username-set' });
  });
});
