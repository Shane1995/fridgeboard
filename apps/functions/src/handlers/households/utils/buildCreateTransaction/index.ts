import type { TransactWriteCommandInput } from '@aws-sdk/lib-dynamodb';
import { householdMetaKey } from '../../../../utils/keys/householdMetaKey/index.ts';
import { membershipKey } from '../../../../utils/keys/membershipKey/index.ts';
import { ownedHouseholdKey } from '../../../../utils/keys/ownedHouseholdKey/index.ts';
import { HouseholdRole } from '../../../../utils/isHouseholdRole/constants.ts';
import { profileKey } from '../../../../utils/keys/profileKey/index.ts';
import {
  CAN_CREATE_CONDITION,
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
      Item: { ...householdMetaKey(id), name, ownerSub: sub, createdAt: now },
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
