import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { HouseholdRole } from '../../../src/utils/isHouseholdRole/constants.ts';
import { InviteType, type TableKey } from '../../../src/utils/keys/types.ts';
import { createTable } from '../../../src/utils/table/index.ts';
import { householdMetaKey } from '../../../src/utils/keys/householdMetaKey/index.ts';
import { inviteKey } from '../../../src/utils/keys/inviteKey/index.ts';
import { membershipKey } from '../../../src/utils/keys/membershipKey/index.ts';
import { ownedHouseholdKey } from '../../../src/utils/keys/ownedHouseholdKey/index.ts';
import { profileKey } from '../../../src/utils/keys/profileKey/index.ts';
import { usernameKey } from '../../../src/utils/keys/usernameKey/index.ts';
import {
  ADMIN_EMAIL,
  APP_INVITE_EMAIL,
  INVITE_TTL_SECONDS,
  MEMBER_INVITE_EMAIL,
  TABLE_NAME,
} from '../constants.ts';
import { subFromEmail } from '../subFromEmail/index.ts';

const HOUSEHOLD_NAME = 'Local Home';
const ADMIN_USERNAME = 'admin';

// Admin with a username and a household, plus one household invite and one app invite.
export const seed = async (client: DynamoDBDocumentClient): Promise<void> => {
  const sub = subFromEmail(ADMIN_EMAIL);
  const hhId = 'local-household';
  const now = new Date().toISOString();
  const nowSeconds = Math.floor(Date.now() / 1000);
  const invite = { invitedBy: sub, expiresAt: nowSeconds + INVITE_TTL_SECONDS };
  const items: (TableKey & Record<string, unknown>)[] = [
    {
      ...profileKey(sub),
      email: ADMIN_EMAIL,
      createdAt: now,
      canCreateHousehold: true,
      username: ADMIN_USERNAME,
    },
    { ...usernameKey(ADMIN_USERNAME), sub },
    { ...householdMetaKey(hhId), name: HOUSEHOLD_NAME, ownerSub: sub, createdAt: now },
    { ...membershipKey(hhId, sub), role: HouseholdRole.Owner, joinedAt: now },
    { ...ownedHouseholdKey(sub), householdId: hhId },
    {
      ...inviteKey(MEMBER_INVITE_EMAIL),
      type: InviteType.Household,
      hhId,
      ...invite,
      ttl: invite.expiresAt,
    },
    { ...inviteKey(APP_INVITE_EMAIL), type: InviteType.App, ...invite, ttl: invite.expiresAt },
  ];
  const table = createTable(client, TABLE_NAME);
  await Promise.all(items.map((item) => table.put(item)));
};
