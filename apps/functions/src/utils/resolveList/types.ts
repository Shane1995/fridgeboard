import type { Table } from '../table/types.ts';
import type { AuthenticatedUser } from '../withAuthenticatedUser/types.ts';

export type ListScope = { householdId: string; listId: string };

export type ListRouteContext = { user: AuthenticatedUser; table: Table; scope: ListScope };

export type ResolveListOptions = { user: AuthenticatedUser; table: Table };

export type ItemRouteOptions = { context: ListRouteContext; itemId: string };

export type ShopRouteOptions = { context: ListRouteContext; shopId: string };
