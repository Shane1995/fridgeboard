import { isMember } from '../../repository/households/isMember/index.ts';
import { ID_PATTERN } from '../resolveList/constants.ts';
import type { HouseholdScope, ResolveHouseholdOptions } from './types.ts';

export const resolveHousehold = async ({
  user: { event, sub },
  table,
}: ResolveHouseholdOptions): Promise<HouseholdScope | undefined> => {
  const { householdId } = event.pathParameters ?? {};
  if (!householdId || !ID_PATTERN.test(householdId)) {
    return undefined;
  }
  return (await isMember({ table, householdId, sub })) ? { householdId } : undefined;
};
