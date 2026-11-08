import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type { IOnboardingResponse } from '@fridgeboard/contract/onboarding';
import { jsonResponse } from '@fridgeboard/lambda-kit/utils/jsonResponse/index.ts';
import { pendingOnboarding } from '@fridgeboard/lambda-kit/utils/pendingOnboarding/index.ts';
import { readProfile } from '@fridgeboard/lambda-kit/utils/readProfile/index.ts';
import { createTable } from '@fridgeboard/lambda-kit/utils/table/index.ts';
import type { AuthenticatedUser } from '@fridgeboard/lambda-kit/utils/withAuthenticatedUser/types.ts';
import { ADMIN_GROUP, GROUPS_CLAIM } from '@fridgeboard/lambda-kit/utils/parseGroups/constants.ts';
import { parseGroups } from '@fridgeboard/lambda-kit/utils/parseGroups/index.ts';

export const getOnboarding = async (
  { claims, sub }: AuthenticatedUser,
  client: DynamoDBDocumentClient,
) => {
  const table = createTable(client, String(process.env.TABLE_NAME));
  const profile = await readProfile(table, sub);
  if (!profile) {
    return { statusCode: 404 };
  }

  const body: IOnboardingResponse = {
    sections: await pendingOnboarding(table, {
      sub,
      profile,
      isAdmin: parseGroups(claims[GROUPS_CLAIM]).includes(ADMIN_GROUP),
    }),
  };
  return jsonResponse(200, body);
};
