import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type { IMeResponse } from '@fridgeboard/contract/me';
import { jsonResponse } from '@fridgeboard/lambda-kit/utils/jsonResponse/index.ts';
import { pendingOnboarding } from '@fridgeboard/lambda-kit/utils/pendingOnboarding/index.ts';
import { readProfile } from '@fridgeboard/lambda-kit/utils/readProfile/index.ts';
import { createTable } from '@fridgeboard/lambda-kit/utils/table/index.ts';
import { withAuthenticatedUser } from '@fridgeboard/lambda-kit/utils/withAuthenticatedUser/index.ts';
import { ADMIN_GROUP, GROUPS_CLAIM } from '@fridgeboard/lambda-kit/utils/parseGroups/constants.ts';
import { parseGroups } from '@fridgeboard/lambda-kit/utils/parseGroups/index.ts';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = withAuthenticatedUser(async ({ claims, sub }) => {
  const table = createTable(client, String(process.env.TABLE_NAME));
  const profile = await readProfile(table, sub);
  if (!profile) {
    return { statusCode: 404 };
  }

  const isAdmin = parseGroups(claims[GROUPS_CLAIM]).includes(ADMIN_GROUP);
  const pending = await pendingOnboarding(table, { sub, profile, isAdmin });
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
