import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { TABLE_NAME } from '../clients/constants.ts';
import { doc } from '../clients/index.ts';
import type { QueryAllInput } from './types.ts';

export const queryAll = async (
  input: QueryAllInput,
  startKey?: Record<string, unknown>,
): Promise<Record<string, unknown>[]> => {
  const { Items = [], LastEvaluatedKey } = await doc.send(
    new QueryCommand({ ...input, TableName: TABLE_NAME, ExclusiveStartKey: startKey }),
  );
  return LastEvaluatedKey ? [...Items, ...(await queryAll(input, LastEvaluatedKey))] : Items;
};
