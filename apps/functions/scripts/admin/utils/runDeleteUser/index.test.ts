import {
  AdminDeleteUserCommand,
  AdminUserGlobalSignOutCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { DeleteEmailIdentityCommand, NotFoundException, SESv2Client } from '@aws-sdk/client-sesv2';
import { DeleteCommand, DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { cognitoMock, resetAdminUserMocks } from '../mockAdminUser/index.ts';
import { runDeleteUser } from './index.ts';

const ddbMock = mockClient(DynamoDBDocumentClient);
const sesMock = mockClient(SESv2Client);

const queryFor = (pk: string, sk?: string) => ({
  KeyConditionExpression: sk ? 'PK = :pk AND begins_with(SK, :sk)' : 'PK = :pk',
  ExpressionAttributeValues: sk ? { ':pk': pk, ':sk': sk } : { ':pk': pk },
});

describe('runDeleteUser', () => {
  beforeEach(() => {
    ddbMock.reset();
    sesMock.reset();
    resetAdminUserMocks();
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
    expect(deleted).toHaveLength(5);
    expect(deleted).toEqual(
      expect.arrayContaining([
        { PK: 'USER#u1', SK: 'PROFILE' },
        { PK: 'HH#h1', SK: 'MEMBER#u1' },
        { PK: 'HH#h2', SK: 'META' },
        { PK: 'HH#h2', SK: 'MEMBER#u1' },
        { PK: 'INVITE#jess@example.com', SK: 'INVITE' },
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

  it('deletes the household member row last and every Dynamo delete precedes AdminDeleteUser', async () => {
    const events: string[] = [];
    ddbMock
      .on(QueryCommand, queryFor('USER#u1'))
      .resolves({ Items: [] })
      .on(QueryCommand, { IndexName: 'GSI1' })
      .resolves({ Items: [{ PK: 'HH#h2', SK: 'MEMBER#u1' }] })
      .on(QueryCommand, queryFor('HH#h2', 'MEMBER#'))
      .resolves({ Items: [{ PK: 'HH#h2', SK: 'MEMBER#u1' }] })
      .on(QueryCommand, queryFor('HH#h2'))
      .resolves({
        Items: [
          { PK: 'HH#h2', SK: 'MEMBER#u1' },
          { PK: 'HH#h2', SK: 'META' },
          { PK: 'HH#h2', SK: 'ITEM#1' },
        ],
      })
      .on(DeleteCommand)
      .callsFake((input: { Key: { SK: string } }) => {
        events.push(`ddb:${input.Key.SK}`);
      });
    cognitoMock.on(AdminDeleteUserCommand).callsFake(() => {
      events.push('cognito-delete');
    });
    sesMock.on(DeleteEmailIdentityCommand).callsFake(() => {
      events.push('ses');
    });

    await runDeleteUser('Jess@Example.com');

    expect(events.indexOf('ddb:MEMBER#u1')).toBeGreaterThan(events.indexOf('ddb:META'));
    expect(events.indexOf('ddb:MEMBER#u1')).toBeGreaterThan(events.indexOf('ddb:ITEM#1'));
    expect(events.at(-1)).toBe('cognito-delete');
    expect(events).toContain('ses');
  });

  it('ignores a missing SES identity', async () => {
    ddbMock.on(QueryCommand).resolves({ Items: [] });
    sesMock
      .on(DeleteEmailIdentityCommand)
      .rejects(new NotFoundException({ message: 'x', $metadata: {} }));

    await expect(runDeleteUser('Jess@Example.com')).resolves.toEqual({ households: 0 });
    expect(cognitoMock.commandCalls(AdminDeleteUserCommand)).toHaveLength(1);
  });
});
