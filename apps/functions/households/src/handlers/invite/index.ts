import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type { SESv2Client } from '@aws-sdk/client-sesv2';
import type { IInviteResponse } from '@fridgeboard/contract/households';
import { reserveInvite } from '@fridgeboard/lambda-kit/repository/households/index.ts';
import { ensureEmailIdentity } from '@fridgeboard/lambda-kit/utils/ensureEmailIdentity/index.ts';
import { jsonResponse } from '@fridgeboard/lambda-kit/utils/jsonResponse/index.ts';
import { readEmail } from '../../utils/readEmail/index.ts';
import { readJsonBody } from '@fridgeboard/lambda-kit/utils/readJsonBody/index.ts';
import { ID_PATTERN } from '@fridgeboard/lambda-kit/utils/resolveList/constants.ts';
import type { AuthenticatedUser } from '@fridgeboard/lambda-kit/utils/withAuthenticatedUser/types.ts';

const REJECTIONS = {
  'not-found': { status: 404, reason: 'not-found' },
  'limit-reached': { status: 409, reason: 'limit-reached' },
  'already-invited': { status: 409, reason: 'already-invited' },
} as const;

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

  const reserved = await reserveInvite({
    client,
    householdId,
    sub,
    email,
    now: Math.floor(Date.now() / 1000),
  });
  if (reserved !== 'reserved') {
    const { status, reason } = REJECTIONS[reserved];
    return jsonResponse(status, { reason });
  }

  try {
    const identity = await ensureEmailIdentity({ ses, emailIdentity: email });
    const response: IInviteResponse = { email, verified: identity === 'verified' };
    return jsonResponse(201, response);
  } catch {
    return jsonResponse(502, { reason: 'verification-failed' });
  }
};
