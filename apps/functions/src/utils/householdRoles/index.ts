import type { HouseholdRole } from '@fridgeboard/contract/households';
import { householdIdFromKey } from '../keys/householdIdFromKey/index.ts';
import { isHouseholdRole } from '../isHouseholdRole/index.ts';

export const householdRoles = (
  memberships: Record<string, unknown>[],
): Map<string, HouseholdRole> => {
  const entries = memberships.flatMap(({ GSI1SK, role }): [string, HouseholdRole][] => {
    const id = householdIdFromKey(GSI1SK);
    return id === undefined || !isHouseholdRole(role) ? [] : [[id, role]];
  });
  return new Map(
    entries.filter(([id], index) => entries.findIndex(([other]) => other === id) === index),
  );
};
