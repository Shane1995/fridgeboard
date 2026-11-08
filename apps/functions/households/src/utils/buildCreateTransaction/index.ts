import type { TransactWriteCommandInput } from '@aws-sdk/lib-dynamodb';
import { householdMetaKey } from '@fridgeboard/lambda-kit/utils/keys/householdMetaKey/index.ts';
import { membershipKey } from '@fridgeboard/lambda-kit/utils/keys/membershipKey/index.ts';
import { ownedHouseholdKey } from '@fridgeboard/lambda-kit/utils/keys/ownedHouseholdKey/index.ts';
import { HouseholdRole } from '@fridgeboard/lambda-kit/utils/isHouseholdRole/constants.ts';
import { profileKey } from '@fridgeboard/lambda-kit/utils/keys/profileKey/index.ts';
import {
  CAN_CREATE_CONDITION,
  INVITE_LIMIT,
  NOT_EXISTS_CONDITION,
  PROFILE_EXISTS_CONDITION,
} from '../../constants.ts';
import type { CreateTransactionParams } from './types.ts';

export const buildCreateTransaction = ({
  TableName,
  id,
  sub,
  name,
  isAdmin,
  now,
}: CreateTransactionParams): NonNullable<TransactWriteCommandInput['TransactItems']> => [
  {
    ConditionCheck: {
      TableName,
      Key: profileKey(sub),
      ConditionExpression: isAdmin ? PROFILE_EXISTS_CONDITION : CAN_CREATE_CONDITION,
      ...(isAdmin ? {} : { ExpressionAttributeValues: { ':allowed': true } }),
    },
  },
  {
    Put: {
      TableName,
      Item: {
        ...householdMetaKey(id),
        name,
        ownerSub: sub,
        createdAt: now,
        ...(isAdmin ? {} : { inviteLimit: INVITE_LIMIT }),
        invitesUsed: 0,
      },
      ConditionExpression: NOT_EXISTS_CONDITION,
    },
  },
  {
    Put: {
      TableName,
      Item: { ...membershipKey(id, sub), role: HouseholdRole.Owner, joinedAt: now },
    },
  },
  {
    Put: {
      TableName,
      Item: { ...ownedHouseholdKey(sub), householdId: id },
      ConditionExpression: NOT_EXISTS_CONDITION,
    },
  },
];
