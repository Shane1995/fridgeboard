import type { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import type { Table } from '../table/types.ts';
import type { AuthenticatedUser } from '../withAuthenticatedUser/types.ts';

export type HouseholdScope = { householdId: string };

export type HouseholdRouteContext = {
  user: AuthenticatedUser;
  table: Table;
  scope: HouseholdScope;
};

export type ResolveHouseholdOptions = { user: AuthenticatedUser; table: Table };

export type HouseholdRouteHandler = (
  context: HouseholdRouteContext,
) => Promise<APIGatewayProxyStructuredResultV2>;
