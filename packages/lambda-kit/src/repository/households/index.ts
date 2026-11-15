import { TransactionCanceledException } from '@aws-sdk/client-dynamodb';
import { TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { buildInvite } from '../../utils/buildInvite/index.ts';
import { ChangeItemSchema } from '../../utils/items/changeItem/index.ts';
import { HouseholdMetaItemSchema } from '../../utils/items/householdMetaItem/index.ts';
import { MemberItemSchema } from '../../utils/items/memberItem/index.ts';
import { ProfileNameItemSchema } from '../../utils/items/profileNameItem/index.ts';
import {
  HOUSEHOLD_PK_PREFIX,
  MEMBER_SK_PREFIX,
  USER_PK_PREFIX,
} from '../../utils/keys/constants.ts';
import { changeKey } from '../../utils/keys/changeKey/index.ts';
import { householdMetaKey } from '../../utils/keys/householdMetaKey/index.ts';
import { membershipKey } from '../../utils/keys/membershipKey/index.ts';
import { profileKey } from '../../utils/keys/profileKey/index.ts';
import { buildCreateTransaction } from './buildCreateTransaction/index.ts';
import {
  CHANGES_RANGE_CONDITION,
  CONDITION_FAILED,
  GUARD_REASON_INDEX,
  INVITE_REASON_INDEX,
  INVITE_ROOM_CONDITION,
  INVITE_SLOT_CONDITION,
  LIMIT_REASON_INDEX,
  MEMBER_EXISTS_CONDITION,
  MEMBER_REASON_INDEX,
  PROFILE_REASON_INDEX,
} from './constants.ts';
import type {
  CreateHouseholdRecordOptions,
  CreateHouseholdResult,
  ReserveInviteResult,
  GetUsernamesOptions,
  HouseholdOptions,
  QueryChangesOptions,
  ReserveInviteOptions,
} from './types.ts';

export const queryMemberships = ({ table, householdId }: HouseholdOptions) =>
  table.query(
    {
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: {
        ':pk': `${HOUSEHOLD_PK_PREFIX}${householdId}`,
        ':prefix': MEMBER_SK_PREFIX,
      },
    },
    MemberItemSchema,
  );

export const getUsernames = async ({
  table,
  subs,
}: GetUsernamesOptions): Promise<Map<string, string | undefined>> => {
  const profiles = await table.batchGet(subs.map(profileKey), ProfileNameItemSchema);
  return new Map(profiles.map(({ PK, username }) => [PK.slice(USER_PK_PREFIX.length), username]));
};

export const getHouseholdRev = async ({ table, householdId }: HouseholdOptions): Promise<number> =>
  (await table.get(householdMetaKey(householdId), HouseholdMetaItemSchema))?.rev ?? 0;

export const queryChanges = ({ table, householdId, from, to }: QueryChangesOptions) =>
  table.query(
    {
      ConsistentRead: true,
      KeyConditionExpression: CHANGES_RANGE_CONDITION,
      ExpressionAttributeValues: {
        ':pk': changeKey({ householdId, rev: to }).PK,
        ':from': changeKey({ householdId, rev: from }).SK,
        ':to': changeKey({ householdId, rev: to }).SK,
      },
    },
    ChangeItemSchema,
  );

const failedAt = (error: TransactionCanceledException, index: number): boolean =>
  error.CancellationReasons?.[index]?.Code === CONDITION_FAILED;

export const createHouseholdRecord = async ({
  client,
  id,
  sub,
  name,
  isAdmin,
  now,
}: CreateHouseholdRecordOptions): Promise<CreateHouseholdResult> => {
  try {
    await client.send(
      new TransactWriteCommand({
        TransactItems: buildCreateTransaction({
          TableName: process.env.TABLE_NAME,
          id,
          sub,
          name,
          isAdmin,
          now,
        }),
      }),
    );
    return 'created';
  } catch (error) {
    if (error instanceof TransactionCanceledException) {
      if (failedAt(error, PROFILE_REASON_INDEX)) {
        return 'not-allowed';
      }
      if (failedAt(error, GUARD_REASON_INDEX)) {
        return 'household-exists';
      }
    }
    throw error;
  }
};

export const reserveInvite = async ({
  client,
  householdId,
  sub,
  email,
  now,
}: ReserveInviteOptions): Promise<ReserveInviteResult> => {
  const TableName = String(process.env.TABLE_NAME);
  const { PK, SK } = membershipKey(householdId, sub);
  try {
    await client.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            ConditionCheck: {
              TableName,
              Key: { PK, SK },
              ConditionExpression: MEMBER_EXISTS_CONDITION,
            },
          },
          {
            Update: {
              TableName,
              Key: householdMetaKey(householdId),
              UpdateExpression: 'ADD invitesUsed :one',
              ConditionExpression: INVITE_ROOM_CONDITION,
              ExpressionAttributeValues: { ':one': 1 },
            },
          },
          {
            Put: {
              TableName,
              Item: buildInvite({
                email,
                app: false,
                admin: false,
                household: householdId,
                invitedBy: sub,
                now,
              }),
              ConditionExpression: INVITE_SLOT_CONDITION,
              ExpressionAttributeValues: { ':now': now },
            },
          },
        ],
      }),
    );
    return 'reserved';
  } catch (error) {
    if (error instanceof TransactionCanceledException) {
      if (failedAt(error, MEMBER_REASON_INDEX)) {
        return 'not-found';
      }
      if (failedAt(error, LIMIT_REASON_INDEX)) {
        return 'limit-reached';
      }
      if (failedAt(error, INVITE_REASON_INDEX)) {
        return 'already-invited';
      }
    }
    throw error;
  }
};
