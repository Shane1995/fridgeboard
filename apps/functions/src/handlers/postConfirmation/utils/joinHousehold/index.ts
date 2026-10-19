import { TransactionCanceledException } from '@aws-sdk/client-dynamodb';
import {
  DeleteCommand,
  type DynamoDBDocumentClient,
  TransactWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import { householdMetaKey } from '../../../../utils/keys/householdMetaKey/index.ts';
import { membershipKey } from '../../../../utils/keys/membershipKey/index.ts';
import { CONDITION_FAILED } from '../../constants.ts';
import {
  HOUSEHOLD_EXISTS_CONDITION,
  HOUSEHOLD_NOT_FOUND_ERROR,
  HOUSEHOLD_REASON_INDEX,
  MEMBER_ROLE,
  MEMBERSHIP_NOT_EXISTS_CONDITION,
  MEMBERSHIP_REASON_INDEX,
} from './constants.ts';
import type { JoinHouseholdParams } from './types.ts';

export const joinHousehold = async (
  client: DynamoDBDocumentClient,
  TableName: string | undefined,
  { hhId, sub, invite }: JoinHouseholdParams,
): Promise<void> => {
  try {
    await client.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            ConditionCheck: {
              TableName,
              Key: householdMetaKey(hhId),
              ConditionExpression: HOUSEHOLD_EXISTS_CONDITION,
            },
          },
          {
            Put: {
              TableName,
              Item: {
                ...membershipKey(hhId, sub),
                role: MEMBER_ROLE,
                joinedAt: new Date().toISOString(),
              },
              ConditionExpression: MEMBERSHIP_NOT_EXISTS_CONDITION,
            },
          },
          { Delete: { TableName, Key: invite } },
        ],
      }),
    );
  } catch (error) {
    if (!(error instanceof TransactionCanceledException)) {
      throw error;
    }
    const reasons = error.CancellationReasons ?? [];
    if (reasons[HOUSEHOLD_REASON_INDEX]?.Code === CONDITION_FAILED) {
      throw new Error(HOUSEHOLD_NOT_FOUND_ERROR);
    }
    if (reasons[MEMBERSHIP_REASON_INDEX]?.Code !== CONDITION_FAILED) {
      throw error;
    }
    await client.send(new DeleteCommand({ TableName, Key: invite }));
  }
};
