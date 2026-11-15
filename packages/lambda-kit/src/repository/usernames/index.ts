import { TransactionCanceledException } from '@aws-sdk/client-dynamodb';
import { TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { profileKey } from '../../utils/keys/profileKey/index.ts';
import { usernameKey } from '../../utils/keys/usernameKey/index.ts';
import { CONDITION_FAILED, PROFILE_REASON_INDEX } from './constants.ts';
import type { ClaimUsernameOptions, ClaimUsernameResult } from './types.ts';

export const claimUsername = async ({
  client,
  sub,
  username,
}: ClaimUsernameOptions): Promise<ClaimUsernameResult> => {
  const TableName = process.env.TABLE_NAME;
  try {
    await client.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            Put: {
              TableName,
              Item: { ...usernameKey(username), sub },
              ConditionExpression: 'attribute_not_exists(PK) OR #sub = :sub',
              ExpressionAttributeNames: { '#sub': 'sub' },
              ExpressionAttributeValues: { ':sub': sub },
            },
          },
          {
            Update: {
              TableName,
              Key: profileKey(sub),
              UpdateExpression: 'SET username = :username',
              ConditionExpression:
                'attribute_exists(PK) AND (attribute_not_exists(username) OR username = :username)',
              ExpressionAttributeValues: { ':username': username },
            },
          },
        ],
      }),
    );
    return 'claimed';
  } catch (error) {
    if (error instanceof TransactionCanceledException) {
      const reasons = error.CancellationReasons ?? [];
      if (reasons[PROFILE_REASON_INDEX]?.Code === CONDITION_FAILED) {
        return 'username-set';
      }
      if (reasons.some(({ Code }) => Code === CONDITION_FAILED)) {
        return 'username-taken';
      }
    }
    throw error;
  }
};
