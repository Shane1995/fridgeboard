import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { BatchGetCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { createTable } from '../table/index.ts';
import { fetchHouseholdNames } from './index.ts';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const table = createTable(client, 'fridgeboard');
const ddbMock = mockClient(DynamoDBDocumentClient);

describe('fetchHouseholdNames', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  it('maps household ids to names from META items', async () => {
    ddbMock.on(BatchGetCommand).resolves({
      Responses: { fridgeboard: [{ PK: 'HH#h1', SK: 'META', name: 'Home' }, { PK: 'junk' }] },
    });

    const names = await fetchHouseholdNames(table, ['h1']);

    expect([...names]).toEqual([['h1', 'Home']]);
  });

  it('makes no calls for no ids', async () => {
    expect((await fetchHouseholdNames(table, [])).size).toBe(0);
    expect(ddbMock.commandCalls(BatchGetCommand)).toHaveLength(0);
  });

  it('chunks requests at 100 keys', async () => {
    ddbMock.on(BatchGetCommand).resolves({ Responses: { fridgeboard: [] } });
    const ids = Array.from({ length: 101 }, (_, i) => `h${i}`);

    await fetchHouseholdNames(table, ids);

    const sizes = ddbMock
      .commandCalls(BatchGetCommand)
      .map((call) => call.args[0].input.RequestItems?.fridgeboard?.Keys?.length);
    expect(sizes).toEqual([100, 1]);
  });

  it('stops at a failing chunk and makes no further calls', async () => {
    ddbMock
      .on(BatchGetCommand)
      .resolvesOnce({ Responses: { fridgeboard: [] } })
      .rejectsOnce(new Error('boom'))
      .resolves({ Responses: { fridgeboard: [] } });
    const ids = Array.from({ length: 250 }, (_, i) => `h${i}`);

    await expect(fetchHouseholdNames(table, ids)).rejects.toThrow('boom');
    expect(ddbMock.commandCalls(BatchGetCommand)).toHaveLength(2);
  });
});
