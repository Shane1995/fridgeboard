import { isMember } from '../isMember/index.ts';
import { ID_PATTERN } from './constants.ts';
import type { ListScope, ResolveListOptions } from './types.ts';

export const resolveList = async ({
  user: { event, sub },
  table,
}: ResolveListOptions): Promise<ListScope | undefined> => {
  const { householdId, listId } = event.pathParameters ?? {};
  if (!householdId || !listId || !ID_PATTERN.test(householdId) || !ID_PATTERN.test(listId)) {
    return undefined;
  }
  return (await isMember({ table, householdId, sub })) ? { householdId, listId } : undefined;
};
