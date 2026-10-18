import {
  AdminDeleteUserCommand,
  AdminGetUserCommand,
  AdminUserGlobalSignOutCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { DeleteCommand, DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { runDeleteUser } from './index.ts';

const ddbMock = mockClient(DynamoDBDocumentClient);
const cognitoMock = mockClient(CognitoIdentityProviderClient);
const ssmMock = mockClient(SSMClient);

const queryFor = (pk: string, sk?: string) => ({
  KeyConditionExpression: sk ? 'PK = :pk AND begins_with(SK, :sk)' : 'PK = :pk',
  ExpressionAttributeValues: sk ? { ':pk': pk, ':sk': sk } : { ':pk': pk },
});

describe('runDeleteUser', () => {
  beforeEach(() => {
    ddbMock.reset();
    cognitoMock.reset();
    ssmMock.reset();
    ssmMock
      .on(GetParameterCommand)
      .resolves({ Parameter: { Value: JSON.stringify({ userPoolId: 'pool-1' }) } });
    cognitoMock
      .on(AdminGetUserCommand)
      .resolves({ UserAttributes: [{ Name: 'sub', Value: 'u1' }] });
  });

  it('signs out, deletes data and empty households, then deletes the user last', async () => {
    ddbMock
      .on(QueryCommand, queryFor('USER#u1'))
      .resolves({ Items: [{ PK: 'USER#u1', SK: 'PROFILE' }] })
      .on(QueryCommand, { IndexName: 'GSI1' })
      .resolves({
        Items: [
          { PK: 'HH#h1', SK: 'MEMBER#u1' },
          { PK: 'HH#h2', SK: 'MEMBER#u1' },
        ],
      })
      .on(QueryCommand, queryFor('HH#h1', 'MEMBER#'))
      .resolves({
        Items: [
          { PK: 'HH#h1', SK: 'MEMBER#u1' },
          { PK: 'HH#h1', SK: 'MEMBER#u2' },
        ],
      })
      .on(QueryCommand, queryFor('HH#h2', 'MEMBER#'))
      .resolves({ Items: [{ PK: 'HH#h2', SK: 'MEMBER#u1' }] })
      .on(QueryCommand, queryFor('HH#h2'))
      .resolves({
        Items: [
          { PK: 'HH#h2', SK: 'META' },
          { PK: 'HH#h2', SK: 'MEMBER#u1' },
        ],
      });

    const result = await runDeleteUser('Jess@Example.com');

    const deleted = ddbMock.commandCalls(DeleteCommand).map((call) => call.args[0].input.Key);
    expect(deleted).toHaveLength(4);
    expect(deleted).toEqual(
      expect.arrayContaining([
        { PK: 'USER#u1', SK: 'PROFILE' },
        { PK: 'HH#h1', SK: 'MEMBER#u1' },
        { PK: 'HH#h2', SK: 'META' },
        { PK: 'HH#h2', SK: 'MEMBER#u1' },
      ]),
    );
    expect(deleted).not.toContainEqual({ PK: 'HH#h1', SK: 'MEMBER#u2' });
    expect(result).toEqual({ households: 1 });

    const order = cognitoMock.calls().map((call) => call.args[0].constructor.name);
    expect(order).toEqual([
      'AdminGetUserCommand',
      'AdminUserGlobalSignOutCommand',
      'AdminDeleteUserCommand',
    ]);
    expect(cognitoMock.commandCalls(AdminUserGlobalSignOutCommand)).toHaveLength(1);
    expect(cognitoMock.commandCalls(AdminDeleteUserCommand)[0]?.args[0].input).toEqual({
      UserPoolId: 'pool-1',
      Username: 'jess@example.com',
    });
  });
});
