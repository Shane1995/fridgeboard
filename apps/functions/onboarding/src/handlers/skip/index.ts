import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type { IOnboardingResponse } from '@fridgeboard/contract/onboarding';
import {
  getProfile,
  saveSkippedSections,
} from '@fridgeboard/lambda-kit/repository/profile/index.ts';
import { SKIPPABLE_SECTIONS } from '@fridgeboard/lambda-kit/utils/buildOnboarding/constants.ts';
import { jsonResponse } from '@fridgeboard/lambda-kit/utils/jsonResponse/index.ts';
import { pendingOnboarding } from '@fridgeboard/lambda-kit/utils/pendingOnboarding/index.ts';
import { createTable } from '@fridgeboard/lambda-kit/utils/table/index.ts';
import type { AuthenticatedUser } from '@fridgeboard/lambda-kit/utils/withAuthenticatedUser/types.ts';
import { ADMIN_GROUP, GROUPS_CLAIM } from '@fridgeboard/lambda-kit/utils/parseGroups/constants.ts';
import { parseGroups } from '@fridgeboard/lambda-kit/utils/parseGroups/index.ts';
import { NOT_SKIPPABLE_REASON } from '../../constants.ts';

export const skipSection = async (
  { claims, event, sub }: AuthenticatedUser,
  client: DynamoDBDocumentClient,
) => {
  const sectionId = [...SKIPPABLE_SECTIONS].find((id) => id === event.pathParameters?.sectionId);
  if (sectionId === undefined) {
    return jsonResponse(400, { reason: NOT_SKIPPABLE_REASON });
  }

  const table = createTable(client, String(process.env.TABLE_NAME));
  const profile = await getProfile(table, sub);
  if (!profile) {
    return { statusCode: 404 };
  }

  const skippedSections = profile.skippedSections.includes(sectionId)
    ? profile.skippedSections
    : [...profile.skippedSections, sectionId];
  if (skippedSections !== profile.skippedSections) {
    const updated = await saveSkippedSections({ table, sub, skippedSections });
    if (updated === undefined) {
      return { statusCode: 404 };
    }
  }

  const body: IOnboardingResponse = {
    sections: await pendingOnboarding(table, {
      sub,
      profile: { ...profile, skippedSections },
      isAdmin: parseGroups(claims[GROUPS_CLAIM]).includes(ADMIN_GROUP),
    }),
  };
  return jsonResponse(200, body);
};
