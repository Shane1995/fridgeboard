import type { IHouseholdSummary } from '@fridgeboard/contract/households';
import { fetchHouseholdNames } from '../fetchHouseholdNames/index.ts';
import { fetchMemberships } from '../fetchMemberships/index.ts';
import { householdRoles } from '../../../utils/householdRoles/index.ts';
import type { Table } from '../../../utils/table/types.ts';

export const listHouseholds = async (table: Table, sub: string): Promise<IHouseholdSummary[]> => {
  const roles = householdRoles(await fetchMemberships(table, sub));
  const names = await fetchHouseholdNames(table, [...roles.keys()]);
  return [...roles].flatMap(([id, role]) => {
    const name = names.get(id);
    return name === undefined ? [] : [{ id, name, role }];
  });
};
