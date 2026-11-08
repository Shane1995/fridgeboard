import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { HouseholdRole } from '@fridgeboard/lambda-kit/utils/isHouseholdRole/constants.ts';
import { InviteType, type TableKey } from '@fridgeboard/lambda-kit/utils/keys/types.ts';
import { MAIN_LIST_ID } from '@fridgeboard/contract/lists/constants';
import { createTable } from '@fridgeboard/lambda-kit/utils/table/index.ts';
import { historyKey } from '@fridgeboard/lambda-kit/utils/keys/historyKey/index.ts';
import { itemKey } from '@fridgeboard/lambda-kit/utils/keys/itemKey/index.ts';
import { shopKey } from '@fridgeboard/lambda-kit/utils/keys/shopKey/index.ts';
import { householdMetaKey } from '@fridgeboard/lambda-kit/utils/keys/householdMetaKey/index.ts';
import { inviteKey } from '@fridgeboard/lambda-kit/utils/keys/inviteKey/index.ts';
import { membershipKey } from '@fridgeboard/lambda-kit/utils/keys/membershipKey/index.ts';
import { ownedHouseholdKey } from '@fridgeboard/lambda-kit/utils/keys/ownedHouseholdKey/index.ts';
import { profileKey } from '@fridgeboard/lambda-kit/utils/keys/profileKey/index.ts';
import { usernameKey } from '@fridgeboard/lambda-kit/utils/keys/usernameKey/index.ts';
import {
  ADMIN_EMAIL,
  APP_INVITE_EMAIL,
  INVITE_TTL_SECONDS,
  MEMBER_INVITE_EMAIL,
  TABLE_NAME,
} from '../constants.ts';
import { subFromEmail } from '../subFromEmail/index.ts';
import { SEED_ITEMS, SEED_SHOPS } from './constants.ts';

const HOUSEHOLD_NAME = 'Local Home';
const ADMIN_USERNAME = 'admin';

// Admin with a username and a household with shops and items, plus one household invite and one app invite.
export const seed = async (client: DynamoDBDocumentClient): Promise<void> => {
  const sub = subFromEmail(ADMIN_EMAIL);
  const hhId = 'local-household';
  const now = new Date().toISOString();
  const nowSeconds = Math.floor(Date.now() / 1000);
  const invite = { invitedBy: sub, expiresAt: nowSeconds + INVITE_TTL_SECONDS };
  const scope = { householdId: hhId, listId: MAIN_LIST_ID };
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
    ...SEED_SHOPS.map((shop, order) => ({
      ...shopKey({ ...scope, shopId: shop.id }),
      ...shop,
      order,
    })),
    ...SEED_ITEMS.map((item) => ({
      ...itemKey({ ...scope, itemId: item.id }),
      ...item,
      createdAt: nowSeconds * 1000,
      addedBy: sub,
    })),
    ...SEED_ITEMS.map(({ name, shopIds }) => ({
      ...historyKey({ ...scope, name }),
      name,
      shopIds,
      count: 1,
    })),
  ];
  const table = createTable(client, TABLE_NAME);
  await Promise.all(items.map((item) => table.put(item)));
};
