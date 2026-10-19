import { householdIdFromKey } from '../../../../src/utils/keys/householdIdFromKey/index.ts';
import { inviteKey } from '../../../../src/utils/keys/inviteKey/index.ts';
import { MEMBER_SK_PREFIX } from '../../../../src/utils/keys/constants.ts';
import type { DeletePlan, DeletePlanInput } from './types.ts';
import { hasKeys } from './utils/hasKeys/index.ts';
import { pickKey } from './utils/pickKey/index.ts';

export const buildDeletePlan = ({
  sub,
  email,
  userItems,
  memberships,
  householdMembers,
}: DeletePlanInput): DeletePlan => {
  const own = `${MEMBER_SK_PREFIX}${sub}`;
  const households = memberships
    .filter((item) => hasKeys(item) && item['SK'] === own)
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
      ...userItems.filter(hasKeys).map(pickKey),
      ...households.filter(({ empty }) => !empty).map(({ item }) => pickKey(item)),
      inviteKey(email),
    ],
    emptyHouseholds: households.filter(({ empty }) => empty).map(({ id }) => id),
  };
};
