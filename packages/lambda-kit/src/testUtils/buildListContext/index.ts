import type { ListRouteContext } from '../../utils/resolveList/types.ts';
import type { Table } from '../../utils/table/types.ts';
import type { AuthenticatedUser } from '../../utils/withAuthenticatedUser/types.ts';
import type { BuildListContextOptions } from './types.ts';

export const TEST_SCOPE = { householdId: 'hh-1', listId: 'main' };

export const buildListContext = ({
  body,
  pathParameters = {},
  query,
}: BuildListContextOptions = {}): ListRouteContext => ({
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
  scope: TEST_SCOPE,
});
