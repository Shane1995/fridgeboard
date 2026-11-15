import { HouseholdMetaItemSchema } from '../../../utils/items/householdMetaItem/index.ts';
import { householdIdFromKey } from '../../../utils/keys/householdIdFromKey/index.ts';
import { householdMetaKey } from '../../../utils/keys/householdMetaKey/index.ts';
import type { Table } from '../../../utils/table/types.ts';

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
