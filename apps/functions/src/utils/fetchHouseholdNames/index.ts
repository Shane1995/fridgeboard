import { HouseholdMetaItemSchema } from '../items/householdMetaItem/index.ts';
import { householdIdFromKey } from '../keys/householdIdFromKey/index.ts';
import { householdMetaKey } from '../keys/householdMetaKey/index.ts';
import type { Table } from '../table/types.ts';

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
