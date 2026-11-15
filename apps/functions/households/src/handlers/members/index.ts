import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type { IHouseholdMember } from '@fridgeboard/contract/households';
import { isHouseholdRole } from '@fridgeboard/lambda-kit/utils/isHouseholdRole/index.ts';
import { HouseholdRole } from '@fridgeboard/lambda-kit/utils/isHouseholdRole/constants.ts';
import {
  getUsernames,
  queryMemberships,
} from '@fridgeboard/lambda-kit/repository/households/index.ts';
import { isMember } from '@fridgeboard/lambda-kit/repository/households/isMember/index.ts';
import { jsonResponse } from '@fridgeboard/lambda-kit/utils/jsonResponse/index.ts';
import { MEMBER_SK_PREFIX } from '@fridgeboard/lambda-kit/utils/keys/constants.ts';
import { ID_PATTERN } from '@fridgeboard/lambda-kit/utils/resolveList/constants.ts';
import { createTable } from '@fridgeboard/lambda-kit/utils/table/index.ts';
import type { AuthenticatedUser } from '@fridgeboard/lambda-kit/utils/withAuthenticatedUser/types.ts';

export const listMembers = async (
  { event, sub }: AuthenticatedUser,
  client: DynamoDBDocumentClient,
) => {
  const table = createTable(client, String(process.env.TABLE_NAME));
  const householdId = event.pathParameters?.householdId;
  if (
    householdId === undefined ||
    !ID_PATTERN.test(householdId) ||
    !(await isMember({ table, householdId, sub }))
  ) {
    return jsonResponse(404, { reason: 'not-found' });
  }

  const memberships = await queryMemberships({ table, householdId });
  const subs = memberships.map(({ SK }) => SK.slice(MEMBER_SK_PREFIX.length));
  const usernames = await getUsernames({ table, subs });

  const members: IHouseholdMember[] = memberships
    .flatMap(({ SK, role }) => {
      const id = SK.slice(MEMBER_SK_PREFIX.length);
      const username = usernames.get(id);
      return isHouseholdRole(role)
        ? [{ id, role, ...(username === undefined ? {} : { username }) }]
        : [];
    })
    .sort(
      (a, b) =>
        Number(b.role === HouseholdRole.Owner) - Number(a.role === HouseholdRole.Owner) ||
        (a.username ?? '').localeCompare(b.username ?? ''),
    );
  return jsonResponse(200, { members });
};
