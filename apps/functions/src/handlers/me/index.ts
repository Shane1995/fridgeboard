import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type { IMeResponse } from '@fridgeboard/contract/me';
import { jsonResponse } from '../../utils/jsonResponse/index.ts';
import { pendingOnboarding } from '../../utils/pendingOnboarding/index.ts';
import { readProfile } from '../../utils/readProfile/index.ts';
import { withAuthenticatedUser } from '../../utils/withAuthenticatedUser/index.ts';
import { ADMIN_GROUP, GROUPS_CLAIM } from './constants.ts';
import { parseGroups } from './utils/parseGroups/index.ts';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = withAuthenticatedUser(async ({ claims, sub }) => {
  const TableName = process.env.TABLE_NAME;
  const profile = await readProfile(client, TableName, sub);
  if (!profile) {
    return { statusCode: 404 };
  }

  const isAdmin = parseGroups(claims[GROUPS_CLAIM]).includes(ADMIN_GROUP);
  const pending = await pendingOnboarding(client, TableName, { sub, profile, isAdmin });
  const body: IMeResponse = {
    sub,
    email: profile.email,
    username: profile.username,
    isAdmin,
    canCreateHousehold: profile.canCreateHousehold,
    hasOnboarding: pending.length > 0,
  };
  return jsonResponse(200, body);
});
