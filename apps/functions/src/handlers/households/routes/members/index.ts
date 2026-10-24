import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type { IHouseholdMember } from '@fridgeboard/contract/households';
import { isHouseholdRole } from '../../../../utils/isHouseholdRole/index.ts';
import { HouseholdRole } from '../../../../utils/isHouseholdRole/constants.ts';
import { MemberItemSchema } from '../../../../utils/items/memberItem/index.ts';
import { isMember } from '../../../../utils/isMember/index.ts';
import { ProfileNameItemSchema } from '../../../../utils/items/profileNameItem/index.ts';
import { jsonResponse } from '../../../../utils/jsonResponse/index.ts';
import {
  HOUSEHOLD_PK_PREFIX,
  MEMBER_SK_PREFIX,
  USER_PK_PREFIX,
} from '../../../../utils/keys/constants.ts';
import { profileKey } from '../../../../utils/keys/profileKey/index.ts';
import { ID_PATTERN } from '../../../../utils/resolveList/constants.ts';
import { createTable } from '../../../../utils/table/index.ts';
import type { AuthenticatedUser } from '../../../../utils/withAuthenticatedUser/types.ts';

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

  const memberships = await table.query(
    {
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: {
        ':pk': `${HOUSEHOLD_PK_PREFIX}${householdId}`,
        ':prefix': MEMBER_SK_PREFIX,
      },
    },
    MemberItemSchema,
  );
  const subs = memberships.map(({ SK }) => SK.slice(MEMBER_SK_PREFIX.length));
  const profiles = await table.batchGet(subs.map(profileKey), ProfileNameItemSchema);
  const usernames = new Map(
    profiles.map(({ PK, username }) => [PK.slice(USER_PK_PREFIX.length), username]),
  );

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
