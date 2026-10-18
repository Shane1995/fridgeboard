import {
  AdminAddUserToGroupCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';
import type { PostConfirmationTriggerEvent } from 'aws-lambda';
import { mockClient } from 'aws-sdk-client-mock';
import { handler } from './index.ts';

const ddbMock = mockClient(DynamoDBDocumentClient);
const cognitoMock = mockClient(CognitoIdentityProviderClient);

const buildEvent = (
  triggerSource: PostConfirmationTriggerEvent['triggerSource'] = 'PostConfirmation_ConfirmSignUp',
): PostConfirmationTriggerEvent => ({
  version: '1',
  region: 'eu-west-2',
  userPoolId: 'pool-1',
  userName: 'user',
  callerContext: { awsSdkVersion: '3', clientId: 'client' },
  triggerSource,
  request: { userAttributes: { sub: 'sub-1', email: ' Jess@Example.com' } },
  response: {},
});

describe('postConfirmation handler', () => {
  beforeEach(() => {
    ddbMock.reset();
    cognitoMock.reset();
    vi.stubEnv('TABLE_NAME', 'fridgeboard');
  });

  it('creates the profile with canCreateHousehold true for an app invite', async () => {
    ddbMock.on(GetCommand).resolves({ Item: { type: 'app' } });

    await handler(buildEvent());

    const input = ddbMock.commandCalls(PutCommand)[0]?.args[0].input;
    expect(input).toMatchObject({
      TableName: 'fridgeboard',
      Item: {
        PK: 'USER#sub-1',
        SK: 'PROFILE',
        email: 'jess@example.com',
        canCreateHousehold: true,
      },
      ConditionExpression: 'attribute_not_exists(PK)',
    });
    expect(typeof input?.Item?.createdAt).toBe('string');
  });

  it('adds admin invitees to the admin group', async () => {
    ddbMock.on(GetCommand).resolves({ Item: { type: 'app', admin: true } });

    await handler(buildEvent());

    expect(cognitoMock.commandCalls(AdminAddUserToGroupCommand)[0]?.args[0].input).toEqual({
      UserPoolId: 'pool-1',
      Username: 'user',
      GroupName: 'admin',
    });
  });

  it('does not add non-admins to the admin group', async () => {
    ddbMock.on(GetCommand).resolves({ Item: { type: 'app' } });

    await handler(buildEvent());

    expect(cognitoMock.commandCalls(AdminAddUserToGroupCommand)).toHaveLength(0);
  });

  it('deletes the app invite after use', async () => {
    ddbMock.on(GetCommand).resolves({ Item: { type: 'app' } });

    await handler(buildEvent());

    expect(ddbMock.commandCalls(DeleteCommand)[0]?.args[0].input).toMatchObject({
      TableName: 'fridgeboard',
      Key: { PK: 'INVITE#jess@example.com', SK: 'INVITE' },
    });
  });

  it('ignores PostConfirmation_ConfirmForgotPassword events', async () => {
    const event = buildEvent('PostConfirmation_ConfirmForgotPassword');

    await expect(handler(event)).resolves.toBe(event);
    expect(ddbMock.calls()).toHaveLength(0);
    expect(cognitoMock.calls()).toHaveLength(0);
  });

  it('tolerates a retried profile write and still finishes the flow', async () => {
    ddbMock.on(GetCommand).resolves({ Item: { type: 'app', admin: true } });
    ddbMock
      .on(PutCommand)
      .rejects(new ConditionalCheckFailedException({ message: 'exists', $metadata: {} }));

    await expect(handler(buildEvent())).resolves.toBeDefined();
    expect(cognitoMock.commandCalls(AdminAddUserToGroupCommand)).toHaveLength(1);
    expect(ddbMock.commandCalls(DeleteCommand)).toHaveLength(1);
  });

  it('does not delete the invite when adding to the admin group fails', async () => {
    ddbMock.on(GetCommand).resolves({ Item: { type: 'app', admin: true } });
    cognitoMock.on(AdminAddUserToGroupCommand).rejects(new Error('cognito down'));

    await expect(handler(buildEvent())).rejects.toThrow('cognito down');
    expect(ddbMock.commandCalls(DeleteCommand)).toHaveLength(0);
  });

  it('throws when sub is missing', async () => {
    const event = buildEvent();
    event.request.userAttributes = { email: 'jess@example.com' };

    await expect(handler(event)).rejects.toThrow('MISSING_SUB');
    expect(ddbMock.calls()).toHaveLength(0);
  });

  it('sets canCreateHousehold false and deletes nothing when no invite exists', async () => {
    ddbMock.on(GetCommand).resolves({});

    await handler(buildEvent());

    expect(ddbMock.commandCalls(PutCommand)[0]?.args[0].input.Item).toMatchObject({
      canCreateHousehold: false,
    });
    expect(ddbMock.commandCalls(DeleteCommand)).toHaveLength(0);
  });
});
