import { householdIdFromKey } from '../../../../src/utils/keys/index.ts';
import type { DeletePlan, DeletePlanInput, Key } from './types.ts';

export type { DeletePlan, Key } from './types.ts';

const MEMBER_SK_PREFIX = 'MEMBER#';

const hasKeys = (item: Key): boolean =>
  typeof item['PK'] === 'string' && typeof item['SK'] === 'string';

const pick = (item: Key): Key => ({ PK: item['PK'], SK: item['SK'] });

export const buildDeletePlan = ({
  sub,
  userItems,
  memberships,
  householdMembers,
}: DeletePlanInput): DeletePlan => {
  const own = `${MEMBER_SK_PREFIX}${sub}`;
  const households = memberships
    .filter(hasKeys)
    .flatMap((item) => {
      const id = householdIdFromKey(item['PK']);
      return id ? [{ id, item }] : [];
    })
    .map(({ id, item }) => ({
      id,
      item,
      empty: (householdMembers[id] ?? []).every((sk) => sk === own),
    }));
  return {
    keys: [
      ...userItems.filter(hasKeys).map(pick),
      ...households.filter(({ empty }) => !empty).map(({ item }) => pick(item)),
    ],
    emptyHouseholds: households.filter(({ empty }) => empty).map(({ id }) => id),
  };
};
