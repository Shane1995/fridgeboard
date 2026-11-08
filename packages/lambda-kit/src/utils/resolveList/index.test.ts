import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { createTable } from '../table/index.ts';
import type { AuthenticatedUser } from '../withAuthenticatedUser/types.ts';
import { resolveList } from './index.ts';

const ddbMock = mockClient(DynamoDBDocumentClient);
const table = createTable(DynamoDBDocumentClient.from(new DynamoDBClient({})), 'fridgeboard');

const userFor = (pathParameters: Record<string, string> | undefined): AuthenticatedUser =>
  ({ sub: 'sub-1', claims: {}, event: { pathParameters } }) as unknown as AuthenticatedUser;

describe('resolveList', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  it('returns the household and list for a member', async () => {
    ddbMock.on(GetCommand).resolves({ Item: { GSI1SK: 'HH#hh-1', role: 'member' } });

    const scope = await resolveList({
      user: userFor({ householdId: 'hh-1', listId: 'main' }),
      table,
    });

    expect(scope).toEqual({ householdId: 'hh-1', listId: 'main' });
    expect(ddbMock.commandCalls(GetCommand)[0]?.args[0].input.Key).toEqual({
      PK: 'HH#hh-1',
      SK: 'MEMBER#sub-1',
    });
  });

  it('returns undefined for someone who is not a member', async () => {
    ddbMock.on(GetCommand).resolves({});

    expect(
      await resolveList({ user: userFor({ householdId: 'hh-1', listId: 'main' }), table }),
    ).toBeUndefined();
  });

  it.each([
    [undefined],
    [{ householdId: 'hh-1' }],
    [{ householdId: 'hh-1', listId: 'a#b' }],
    [{ householdId: 'hh#1', listId: 'main' }],
  ])('rejects bad path parameters %j without reading the table', async (pathParameters) => {
    expect(await resolveList({ user: userFor(pathParameters), table })).toBeUndefined();
    expect(ddbMock.commandCalls(GetCommand)).toHaveLength(0);
  });
});
