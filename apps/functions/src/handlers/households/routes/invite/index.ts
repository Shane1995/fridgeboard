import { TransactionCanceledException } from '@aws-sdk/client-dynamodb';
import { type DynamoDBDocumentClient, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import type { SESv2Client } from '@aws-sdk/client-sesv2';
import type { IInviteResponse } from '@fridgeboard/contract/households';
import { buildInvite } from '../../../../utils/buildInvite/index.ts';
import { ensureEmailIdentity } from '../../../../utils/ensureEmailIdentity/index.ts';
import { jsonResponse } from '../../../../utils/jsonResponse/index.ts';
import { householdMetaKey } from '../../../../utils/keys/householdMetaKey/index.ts';
import { membershipKey } from '../../../../utils/keys/membershipKey/index.ts';
import { readEmail } from '../../../../utils/readEmail/index.ts';
import { readJsonBody } from '../../../../utils/readJsonBody/index.ts';
import { ID_PATTERN } from '../../../../utils/resolveList/constants.ts';
import type { AuthenticatedUser } from '../../../../utils/withAuthenticatedUser/types.ts';
import {
  CONDITION_FAILED,
  INVITE_REASON_INDEX,
  INVITE_ROOM_CONDITION,
  INVITE_SLOT_CONDITION,
  LIMIT_REASON_INDEX,
  MEMBER_EXISTS_CONDITION,
  MEMBER_REASON_INDEX,
} from '../../constants.ts';

const failedAt = (error: TransactionCanceledException, index: number): boolean =>
  error.CancellationReasons?.[index]?.Code === CONDITION_FAILED;

const mapCancellation = (error: unknown) => {
  if (!(error instanceof TransactionCanceledException)) {
    return undefined;
  }
  if (failedAt(error, MEMBER_REASON_INDEX)) {
    return jsonResponse(404, { reason: 'not-found' });
  }
  if (failedAt(error, LIMIT_REASON_INDEX)) {
    return jsonResponse(409, { reason: 'limit-reached' });
  }
  if (failedAt(error, INVITE_REASON_INDEX)) {
    return jsonResponse(409, { reason: 'already-invited' });
  }
  return undefined;
};

export const inviteToHousehold = async (
  { event, sub }: AuthenticatedUser,
  client: DynamoDBDocumentClient,
  ses: SESv2Client,
) => {
  const householdId = event.pathParameters?.householdId;
  if (householdId === undefined || !ID_PATTERN.test(householdId)) {
    return jsonResponse(404, { reason: 'not-found' });
  }
  const body = readJsonBody(event);
  const email = readEmail(
    typeof body === 'object' && body !== null && 'email' in body ? body.email : undefined,
  );
  if (email === undefined) {
    return jsonResponse(400, { reason: 'invalid-email' });
  }

  const TableName = String(process.env.TABLE_NAME);
  const now = Math.floor(Date.now() / 1000);
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
  } catch (error) {
    const failure = mapCancellation(error);
    if (failure) {
      return failure;
    }
    throw error;
  }

  try {
    const identity = await ensureEmailIdentity({ ses, emailIdentity: email });
    const response: IInviteResponse = { email, verified: identity === 'verified' };
    return jsonResponse(201, response);
  } catch {
    return jsonResponse(502, { reason: 'verification-failed' });
  }
};
