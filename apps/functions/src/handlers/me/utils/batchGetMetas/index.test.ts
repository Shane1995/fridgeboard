import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { BatchGetCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { batchGetMetas } from './index.ts';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const ddbMock = mockClient(DynamoDBDocumentClient);
const key = { PK: 'HH#h1', SK: 'META' };
const meta = { ...key, name: 'Home' };

describe('batchGetMetas', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  it('returns the found items', async () => {
    ddbMock.on(BatchGetCommand).resolves({ Responses: { fridgeboard: [meta] } });

    expect(await batchGetMetas(client, 'fridgeboard', [key])).toEqual([meta]);
    expect(ddbMock.commandCalls(BatchGetCommand)[0]?.args[0].input).toEqual({
      RequestItems: { fridgeboard: { Keys: [key] } },
    });
  });

  it('retries unprocessed keys once', async () => {
    ddbMock
      .on(BatchGetCommand)
      .resolvesOnce({ UnprocessedKeys: { fridgeboard: { Keys: [key] } } })
      .resolvesOnce({ Responses: { fridgeboard: [meta] } });

    expect(await batchGetMetas(client, 'fridgeboard', [key])).toEqual([meta]);
    expect(ddbMock.commandCalls(BatchGetCommand)).toHaveLength(2);
  });

  it('resends only the unprocessed keys and merges items from both calls', async () => {
    const otherKey = { PK: 'HH#h2', SK: 'META' };
    const otherMeta = { ...otherKey, name: 'Flat' };
    ddbMock
      .on(BatchGetCommand)
      .resolvesOnce({
        Responses: { fridgeboard: [meta] },
        UnprocessedKeys: { fridgeboard: { Keys: [otherKey] } },
      })
      .resolvesOnce({ Responses: { fridgeboard: [otherMeta] } });

    expect(await batchGetMetas(client, 'fridgeboard', [key, otherKey])).toEqual([meta, otherMeta]);
    expect(ddbMock.commandCalls(BatchGetCommand)[1]?.args[0].input).toEqual({
      RequestItems: { fridgeboard: { Keys: [otherKey] } },
    });
  });

  it('throws when keys are still unprocessed after the retry', async () => {
    ddbMock.on(BatchGetCommand).resolves({ UnprocessedKeys: { fridgeboard: { Keys: [key] } } });

    await expect(batchGetMetas(client, 'fridgeboard', [key])).rejects.toThrow('UNPROCESSED_KEYS');
    expect(ddbMock.commandCalls(BatchGetCommand)).toHaveLength(2);
  });
});
