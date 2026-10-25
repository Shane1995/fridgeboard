import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type { IOnboardingResponse } from '@fridgeboard/contract/onboarding';
import { jsonResponse } from '../../../../utils/jsonResponse/index.ts';
import { pendingOnboarding } from '../../../../utils/pendingOnboarding/index.ts';
import { readProfile } from '../../../../utils/readProfile/index.ts';
import { createTable } from '../../../../utils/table/index.ts';
import type { AuthenticatedUser } from '../../../../utils/withAuthenticatedUser/types.ts';
import { ADMIN_GROUP, GROUPS_CLAIM } from '../../../me/constants.ts';
import { parseGroups } from '../../../me/utils/parseGroups/index.ts';

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
