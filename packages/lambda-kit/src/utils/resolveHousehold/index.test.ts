import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { createTable } from '../table/index.ts';
import type { AuthenticatedUser } from '../withAuthenticatedUser/types.ts';
import { resolveHousehold } from './index.ts';

const ddbMock = mockClient(DynamoDBDocumentClient);
const table = createTable(DynamoDBDocumentClient.from(new DynamoDBClient({})), 'fridgeboard');

const userFor = (pathParameters: Record<string, string> | undefined): AuthenticatedUser =>
  ({ sub: 'sub-1', claims: {}, event: { pathParameters } }) as unknown as AuthenticatedUser;

describe('resolveHousehold', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  it('returns the household for a member', async () => {
    ddbMock.on(GetCommand).resolves({ Item: { GSI1SK: 'HH#hh-1', role: 'member' } });

    const scope = await resolveHousehold({ user: userFor({ householdId: 'hh-1' }), table });

    expect(scope).toEqual({ householdId: 'hh-1' });
    expect(ddbMock.commandCalls(GetCommand)[0]?.args[0].input.Key).toEqual({
      PK: 'HH#hh-1',
      SK: 'MEMBER#sub-1',
    });
  });

  it('is undefined for a non-member', async () => {
    ddbMock.on(GetCommand).resolves({});

    expect(
      await resolveHousehold({ user: userFor({ householdId: 'hh-1' }), table }),
    ).toBeUndefined();
  });

  it.each([[undefined], [{}], [{ householdId: 'hh#1' }], [{ householdId: '' }]])(
    'is undefined for an invalid household id %j without reading the table',
    async (pathParameters) => {
      expect(await resolveHousehold({ user: userFor(pathParameters), table })).toBeUndefined();
      expect(ddbMock.commandCalls(GetCommand)).toHaveLength(0);
    },
  );
});
