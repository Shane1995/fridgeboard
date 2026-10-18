import { QueryCommand, type QueryCommandInput } from '@aws-sdk/lib-dynamodb';
import { doc, TABLE_NAME } from '../clients/index.ts';

export const queryAll = async (
  input: Omit<QueryCommandInput, 'TableName' | 'ExclusiveStartKey'>,
  startKey?: Record<string, unknown>,
): Promise<Record<string, unknown>[]> => {
  const { Items = [], LastEvaluatedKey } = await doc.send(
    new QueryCommand({ ...input, TableName: TABLE_NAME, ExclusiveStartKey: startKey }),
  );
  return LastEvaluatedKey ? [...Items, ...(await queryAll(input, LastEvaluatedKey))] : Items;
};
