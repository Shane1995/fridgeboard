import { randomUUID } from 'node:crypto';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import type { PostConfirmationTriggerEvent } from 'aws-lambda';
import { client } from '../../../test/dynamodbLocal/client/index.ts';
import { getItem } from '../../../test/dynamodbLocal/getItem/index.ts';
import { TABLE_NAME } from '../../../test/dynamodbLocal/constants.ts';
import { householdMetaKey } from '../../utils/keys/householdMetaKey/index.ts';
import { inviteKey } from '../../utils/keys/inviteKey/index.ts';
import { membershipKey } from '../../utils/keys/membershipKey/index.ts';
import { profileKey } from '../../utils/keys/profileKey/index.ts';
import { handler } from './index.ts';

const buildEvent = (sub: string, email: string): PostConfirmationTriggerEvent => ({
  version: '1',
  region: 'eu-west-2',
  userPoolId: 'pool-1',
  userName: sub,
  callerContext: { awsSdkVersion: '3', clientId: 'client' },
  triggerSource: 'PostConfirmation_ConfirmSignUp',
  request: { userAttributes: { sub, email } },
  response: {},
});

describe('postConfirmation handler against DynamoDB Local', () => {
  it('creates a profile that may create a household and consumes an app invite', async () => {
    const sub = randomUUID();
    const email = `${sub}@example.com`;
    await client.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: { ...inviteKey(email), type: 'app', invitedBy: 'admin' },
      }),
    );

    await handler(buildEvent(sub, email));

    expect(await getItem(profileKey(sub))).toMatchObject({ email, canCreateHousehold: true });
    expect(await getItem(inviteKey(email))).toBeUndefined();
  });

  it('joins the household of a household invite as a member', async () => {
    const sub = randomUUID();
    const hhId = randomUUID();
    const email = `${sub}@example.com`;
    await client.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: { ...householdMetaKey(hhId), name: 'Linden', ownerSub: 'owner' },
      }),
    );
    await client.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: { ...inviteKey(email), type: 'household', hhId, invitedBy: 'owner' },
      }),
    );

    await handler(buildEvent(sub, email));

    expect(await getItem(profileKey(sub))).toMatchObject({ canCreateHousehold: false });
    expect(await getItem(membershipKey(hhId, sub))).toMatchObject({ role: 'member' });
    expect(await getItem(inviteKey(email))).toBeUndefined();
  });

  it('is idempotent when the membership already exists', async () => {
    const sub = randomUUID();
    const hhId = randomUUID();
    const email = `${sub}@example.com`;
    await client.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: { ...householdMetaKey(hhId), name: 'Linden' },
      }),
    );
    await client.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: { ...membershipKey(hhId, sub), role: 'member' },
      }),
    );
    await client.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: { ...inviteKey(email), type: 'household', hhId, invitedBy: 'owner' },
      }),
    );

    await handler(buildEvent(sub, email));

    expect(await getItem(inviteKey(email))).toBeUndefined();
  });
});
