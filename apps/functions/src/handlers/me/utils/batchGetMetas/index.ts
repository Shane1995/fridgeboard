import { BatchGetCommand, type DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { UNPROCESSED_KEYS_ERROR } from './constants.ts';

export const batchGetMetas = async (
  client: DynamoDBDocumentClient,
  TableName: string,
  Keys: Record<string, unknown>[],
  retried = false,
): Promise<Record<string, unknown>[]> => {
  const { Responses, UnprocessedKeys } = await client.send(
    new BatchGetCommand({ RequestItems: { [TableName]: { Keys } } }),
  );
  const found = Responses?.[TableName] ?? [];
  const unprocessed = UnprocessedKeys?.[TableName]?.Keys ?? [];
  if (unprocessed.length === 0) {
    return found;
  }
  if (retried) {
    throw new Error(UNPROCESSED_KEYS_ERROR);
  }
  return [...found, ...(await batchGetMetas(client, TableName, unprocessed, true))];
};
