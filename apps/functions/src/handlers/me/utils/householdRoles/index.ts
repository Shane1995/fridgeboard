import { householdIdFromKey } from '../../../../utils/keys/householdIdFromKey/index.ts';

export const householdRoles = (memberships: Record<string, unknown>[]): Map<string, string> => {
  const entries = memberships.flatMap(({ GSI1SK, role }): [string, string][] => {
    const id = householdIdFromKey(GSI1SK);
    return id === undefined ? [] : [[id, String(role)]];
  });
  return new Map(
    entries.filter(([id], index) => entries.findIndex(([other]) => other === id) === index),
  );
};
