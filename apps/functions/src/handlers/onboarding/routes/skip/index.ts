import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type { IOnboardingResponse } from '@fridgeboard/contract/onboarding';
import { SKIPPABLE_SECTIONS } from '../../../../utils/buildOnboarding/constants.ts';
import { jsonResponse } from '../../../../utils/jsonResponse/index.ts';
import { profileKey } from '../../../../utils/keys/profileKey/index.ts';
import { ProfileItemSchema } from '../../../../utils/items/profileItem/index.ts';
import { pendingOnboarding } from '../../../../utils/pendingOnboarding/index.ts';
import { readProfile } from '../../../../utils/readProfile/index.ts';
import { createTable } from '../../../../utils/table/index.ts';
import type { AuthenticatedUser } from '../../../../utils/withAuthenticatedUser/types.ts';
import { ADMIN_GROUP, GROUPS_CLAIM } from '../../../me/constants.ts';
import { parseGroups } from '../../../me/utils/parseGroups/index.ts';
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
  const profile = await readProfile(table, sub);
  if (!profile) {
    return { statusCode: 404 };
  }

  const skippedSections = profile.skippedSections.includes(sectionId)
    ? profile.skippedSections
    : [...profile.skippedSections, sectionId];
  if (skippedSections !== profile.skippedSections) {
    const updated = await table.update({
      key: profileKey(sub),
      parts: { set: { skippedSections } },
      schema: ProfileItemSchema,
    });
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
