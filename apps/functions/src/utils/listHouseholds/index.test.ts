import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { BatchGetCommand, DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { HouseholdRole } from '../isHouseholdRole/constants.ts';
import { createTable } from '../table/index.ts';
import { listHouseholds } from './index.ts';

const ddbMock = mockClient(DynamoDBDocumentClient);
const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const table = createTable(client, 'fridgeboard');

describe('listHouseholds', () => {
  beforeEach(() => {
    ddbMock.reset();
    ddbMock.on(QueryCommand).resolves({ Items: [] });
  });

  it('returns an empty list when the user has no memberships', async () => {
    expect(await listHouseholds(table, 'sub-1')).toEqual([]);
    expect(ddbMock.commandCalls(BatchGetCommand)).toHaveLength(0);
  });

  it('returns households from GSI1 with names from META', async () => {
    ddbMock.on(QueryCommand).resolves({
      Items: [
        {
          PK: 'HH#h1',
          SK: 'MEMBER#sub-1',
          GSI1PK: 'USER#sub-1',
          GSI1SK: 'HH#h1',
          role: HouseholdRole.Owner,
        },
        {
          PK: 'HH#h2',
          SK: 'MEMBER#sub-1',
          GSI1PK: 'USER#sub-1',
          GSI1SK: 'HH#h2',
          role: HouseholdRole.Member,
        },
      ],
    });
    ddbMock.on(BatchGetCommand).resolves({
      Responses: {
        fridgeboard: [
          { PK: 'HH#h2', SK: 'META', name: 'Cabin' },
          { PK: 'HH#h1', SK: 'META', name: 'Home' },
        ],
      },
    });

    const result = await listHouseholds(table, 'sub-1');

    expect(ddbMock.commandCalls(QueryCommand)[0]?.args[0].input).toMatchObject({
      TableName: 'fridgeboard',
      IndexName: 'GSI1',
      ExpressionAttributeValues: { ':pk': 'USER#sub-1' },
    });
    expect(ddbMock.commandCalls(BatchGetCommand)[0]?.args[0].input).toEqual({
      RequestItems: {
        fridgeboard: {
          Keys: [
            { PK: 'HH#h1', SK: 'META' },
            { PK: 'HH#h2', SK: 'META' },
          ],
        },
      },
    });
    expect(result).toEqual([
      { id: 'h1', name: 'Home', role: HouseholdRole.Owner },
      { id: 'h2', name: 'Cabin', role: HouseholdRole.Member },
    ]);
  });

  it('dedupes duplicate memberships for one household', async () => {
    ddbMock.on(QueryCommand).resolves({
      Items: [
        { GSI1SK: 'HH#h1', role: HouseholdRole.Owner },
        { GSI1SK: 'HH#h1', role: HouseholdRole.Owner },
      ],
    });
    ddbMock.on(BatchGetCommand).resolves({
      Responses: { fridgeboard: [{ PK: 'HH#h1', SK: 'META', name: 'Home' }] },
    });

    const result = await listHouseholds(table, 'sub-1');

    expect(ddbMock.commandCalls(BatchGetCommand)[0]?.args[0].input).toEqual({
      RequestItems: { fridgeboard: { Keys: [{ PK: 'HH#h1', SK: 'META' }] } },
    });
    expect(result).toEqual([{ id: 'h1', name: 'Home', role: HouseholdRole.Owner }]);
  });

  it('skips memberships with a missing or malformed GSI1SK', async () => {
    ddbMock.on(QueryCommand).resolves({
      Items: [{ role: HouseholdRole.Owner }, { GSI1SK: 'junk', role: HouseholdRole.Owner }],
    });

    const result = await listHouseholds(table, 'sub-1');

    expect(result).toEqual([]);
    expect(ddbMock.commandCalls(BatchGetCommand)).toHaveLength(0);
  });

  it('follows LastEvaluatedKey until the membership query is done', async () => {
    ddbMock
      .on(QueryCommand)
      .resolvesOnce({
        Items: [{ GSI1SK: 'HH#h1', role: HouseholdRole.Owner }],
        LastEvaluatedKey: { PK: 'HH#h1', SK: 'MEMBER#sub-1' },
      })
      .resolvesOnce({ Items: [{ GSI1SK: 'HH#h2', role: HouseholdRole.Member }] });
    ddbMock.on(BatchGetCommand).resolves({
      Responses: {
        fridgeboard: [
          { PK: 'HH#h1', SK: 'META', name: 'Home' },
          { PK: 'HH#h2', SK: 'META', name: 'Cabin' },
        ],
      },
    });

    const result = await listHouseholds(table, 'sub-1');

    const queries = ddbMock.commandCalls(QueryCommand);
    expect(queries).toHaveLength(2);
    expect(queries[1]?.args[0].input.ExclusiveStartKey).toEqual({
      PK: 'HH#h1',
      SK: 'MEMBER#sub-1',
    });
    expect(result).toHaveLength(2);
  });

  it('chunks BatchGet at 100 keys', async () => {
    const Items = Array.from({ length: 101 }, (_, i) => ({
      GSI1SK: `HH#h${i}`,
      role: HouseholdRole.Member,
    }));
    ddbMock.on(QueryCommand).resolves({ Items });
    ddbMock.on(BatchGetCommand).resolves({ Responses: { fridgeboard: [] } });

    await listHouseholds(table, 'sub-1');

    const calls = ddbMock.commandCalls(BatchGetCommand);
    expect(calls.map((c) => c.args[0].input.RequestItems?.fridgeboard?.Keys?.length)).toEqual([
      100, 1,
    ]);
  });

  it('retries unprocessed BatchGet keys once', async () => {
    ddbMock.on(QueryCommand).resolves({ Items: [{ GSI1SK: 'HH#h1', role: HouseholdRole.Owner }] });
    ddbMock
      .on(BatchGetCommand)
      .resolvesOnce({
        Responses: { fridgeboard: [] },
        UnprocessedKeys: { fridgeboard: { Keys: [{ PK: 'HH#h1', SK: 'META' }] } },
      })
      .resolvesOnce({ Responses: { fridgeboard: [{ PK: 'HH#h1', SK: 'META', name: 'Home' }] } });

    const result = await listHouseholds(table, 'sub-1');

    expect(ddbMock.commandCalls(BatchGetCommand)).toHaveLength(2);
    expect(result).toEqual([{ id: 'h1', name: 'Home', role: HouseholdRole.Owner }]);
  });

  it('throws when BatchGet keys are still unprocessed after the retry', async () => {
    ddbMock.on(QueryCommand).resolves({ Items: [{ GSI1SK: 'HH#h1', role: HouseholdRole.Owner }] });
    ddbMock.on(BatchGetCommand).resolves({
      Responses: { fridgeboard: [] },
      UnprocessedKeys: { fridgeboard: { Keys: [{ PK: 'HH#h1', SK: 'META' }] } },
    });

    await expect(listHouseholds(table, 'sub-1')).rejects.toThrow();
    expect(ddbMock.commandCalls(BatchGetCommand)).toHaveLength(2);
  });
});
