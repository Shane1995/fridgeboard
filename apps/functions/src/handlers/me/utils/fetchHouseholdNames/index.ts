import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { householdIdFromKey, householdMetaKey } from '../../../../utils/keys/index.ts';
import { batchGetMetas } from '../batchGetMetas/index.ts';
import { BATCH_GET_LIMIT } from './constants.ts';

export const fetchHouseholdNames = async (
  client: DynamoDBDocumentClient,
  TableName: string,
  ids: string[],
): Promise<Map<string, string>> => {
  const chunks = Array.from({ length: Math.ceil(ids.length / BATCH_GET_LIMIT) }, (_, i) =>
    ids.slice(i * BATCH_GET_LIMIT, (i + 1) * BATCH_GET_LIMIT).map(householdMetaKey),
  );
  const metas = await chunks.reduce<Promise<Record<string, unknown>[]>>(
    async (previous, Keys) => [
      ...(await previous),
      ...(await batchGetMetas(client, TableName, Keys)),
    ],
    Promise.resolve([]),
  );
  return new Map(
    metas.flatMap(({ PK, name }): [string, string][] => {
      const id = householdIdFromKey(PK);
      return id === undefined ? [] : [[id, String(name)]];
    }),
  );
};
