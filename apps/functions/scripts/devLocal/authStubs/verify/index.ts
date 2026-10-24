import { GetCommand } from '@aws-sdk/lib-dynamodb';
import type { APIGatewayProxyStructuredResultV2, PostConfirmationTriggerEvent } from 'aws-lambda';
import type { AuthRequest } from '../../../../src/handlers/auth/types.ts';
import { handler as postConfirmation } from '../../../../src/handlers/postConfirmation/index.ts';
import { readBodyField } from '../../../../src/handlers/auth/utils/readBodyField/index.ts';
import { readCookie } from '../../../../src/handlers/auth/utils/cookies/readCookie/index.ts';
import { jsonResponse } from '../../../../src/utils/jsonResponse/index.ts';
import { profileKey } from '../../../../src/utils/keys/profileKey/index.ts';
import { client } from '../../client/index.ts';
import { FLOW_COOKIE, REGION, SIGN_IN_CODE, TABLE_NAME } from '../../constants.ts';
import { sessionResult } from '../../sessionResult/index.ts';
import { subFromEmail } from '../../subFromEmail/index.ts';

const confirmEvent = (sub: string, email: string): PostConfirmationTriggerEvent => ({
  version: '1',
  region: REGION,
  userPoolId: 'local',
  userName: sub,
  callerContext: { awsSdkVersion: '3', clientId: 'local' },
  triggerSource: 'PostConfirmation_ConfirmSignUp',
  request: { userAttributes: { sub, email } },
  response: {},
});

export const verify = async (event: AuthRequest): Promise<APIGatewayProxyStructuredResultV2> => {
  const flow = readCookie(event.cookies, FLOW_COOKIE);
  if (!flow) {
    return jsonResponse(400, { reason: 'expired' });
  }
  if (readBodyField(event, 'code') !== SIGN_IN_CODE) {
    return jsonResponse(400, { reason: 'bad-code' });
  }
  const email = Buffer.from(flow, 'base64url').toString();
  const sub = subFromEmail(email);
  const { Item } = await client.send(
    new GetCommand({ TableName: TABLE_NAME, Key: profileKey(sub), ConsistentRead: true }),
  );
  if (!Item) {
    await postConfirmation(confirmEvent(sub, email));
  }
  return sessionResult(email);
};
