import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import type { PreSignUpTriggerEvent } from 'aws-lambda';
import { mockClient } from 'aws-sdk-client-mock';
import { NO_INVITE_ERROR } from './constants.ts';
import { handler } from './index.ts';

const ddbMock = mockClient(DynamoDBDocumentClient);

const buildEvent = (email: string): PreSignUpTriggerEvent => ({
  version: '1',
  region: 'eu-west-2',
  userPoolId: 'pool',
  userName: 'user',
  callerContext: { awsSdkVersion: '3', clientId: 'client' },
  triggerSource: 'PreSignUp_SignUp',
  request: { userAttributes: { email } },
  response: { autoConfirmUser: false, autoVerifyEmail: false, autoVerifyPhone: false },
});

const nowSeconds = (): number => Math.floor(Date.now() / 1000);

describe('preSignUp handler', () => {
  beforeEach(() => {
    ddbMock.reset();
    vi.stubEnv('TABLE_NAME', 'fridgeboard');
  });

  it('allows sign-up when an unexpired invite exists', async () => {
    ddbMock.on(GetCommand).resolves({ Item: { expiresAt: nowSeconds() + 3600 } });
    const event = buildEvent('jess@example.com');

    await expect(handler(event)).resolves.toBe(event);
  });

  it('rejects when no invite exists', async () => {
    ddbMock.on(GetCommand).resolves({});

    await expect(handler(buildEvent('jess@example.com'))).rejects.toThrow(NO_INVITE_ERROR);
  });

  it('rejects when the invite has expired', async () => {
    ddbMock.on(GetCommand).resolves({ Item: { expiresAt: nowSeconds() - 1 } });

    await expect(handler(buildEvent('jess@example.com'))).rejects.toThrow(NO_INVITE_ERROR);
  });

  it('looks up the invite by normalised email', async () => {
    ddbMock.on(GetCommand).resolves({ Item: { expiresAt: nowSeconds() + 3600 } });

    await handler(buildEvent(' Jess@Example.com'));

    expect(ddbMock.commandCalls(GetCommand)[0]?.args[0].input).toMatchObject({
      TableName: 'fridgeboard',
      Key: { PK: 'INVITE#jess@example.com', SK: 'INVITE' },
      ConsistentRead: true,
    });
  });
});
