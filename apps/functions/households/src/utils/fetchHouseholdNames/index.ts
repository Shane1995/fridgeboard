import { HouseholdMetaItemSchema } from '@fridgeboard/lambda-kit/utils/items/householdMetaItem/index.ts';
import { householdIdFromKey } from '@fridgeboard/lambda-kit/utils/keys/householdIdFromKey/index.ts';
import { householdMetaKey } from '@fridgeboard/lambda-kit/utils/keys/householdMetaKey/index.ts';
import type { Table } from '@fridgeboard/lambda-kit/utils/table/types.ts';

export const fetchHouseholdNames = async (
  table: Table,
  ids: string[],
): Promise<Map<string, string>> => {
  const metas = await table.batchGet(ids.map(householdMetaKey), HouseholdMetaItemSchema);
  return new Map(
    metas.flatMap(({ PK, name }): [string, string][] => {
      const id = householdIdFromKey(PK);
      return id === undefined ? [] : [[id, name]];
    }),
  );
};
