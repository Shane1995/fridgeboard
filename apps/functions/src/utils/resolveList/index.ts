import { isMember } from '../isMember/index.ts';
import type { Table } from '../table/types.ts';
import type { AuthenticatedUser } from '../withAuthenticatedUser/types.ts';
import { ID_PATTERN } from './constants.ts';
import type { ListScope } from './types.ts';

export const resolveList = async (
  { event, sub }: AuthenticatedUser,
  table: Table,
): Promise<ListScope | undefined> => {
  const { householdId, listId } = event.pathParameters ?? {};
  if (!householdId || !listId || !ID_PATTERN.test(householdId) || !ID_PATTERN.test(listId)) {
    return undefined;
  }
  return (await isMember(table, householdId, sub)) ? { householdId, listId } : undefined;
};
