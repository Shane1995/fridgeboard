import type { Table } from '../table/types.ts';
import type { AuthenticatedUser } from '../withAuthenticatedUser/types.ts';

export type ListScope = { householdId: string; listId: string };

export type ListRouteContext = { user: AuthenticatedUser; table: Table; scope: ListScope };
