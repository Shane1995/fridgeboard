import type { HouseholdRouteContext } from '../../utils/resolveHousehold/types.ts';
import type { Table } from '../../utils/table/types.ts';
import type { AuthenticatedUser } from '../../utils/withAuthenticatedUser/types.ts';
import type { BuildHouseholdContextOptions } from './types.ts';

export const TEST_HOUSEHOLD_SCOPE = { householdId: 'hh-1' };

export const buildHouseholdContext = ({
  body,
  pathParameters = {},
  query,
}: BuildHouseholdContextOptions = {}): HouseholdRouteContext => ({
  user: {
    event: {
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      pathParameters,
      queryStringParameters: query,
    },
    claims: {},
    sub: 'sub-1',
  } as unknown as AuthenticatedUser,
  table: {} as Table,
  scope: TEST_HOUSEHOLD_SCOPE,
});
