import { GetCommand } from '@aws-sdk/lib-dynamodb';
import type { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import type { AuthRequest } from '../../../../src/handlers/auth/types.ts';
import { readBodyField } from '../../../../src/handlers/auth/utils/readBodyField/index.ts';
import { jsonResponse } from '../../../../src/utils/jsonResponse/index.ts';
import { inviteKey } from '../../../../src/utils/keys/inviteKey/index.ts';
import { profileKey } from '../../../../src/utils/keys/profileKey/index.ts';
import { normaliseEmail } from '../../../../src/utils/normaliseEmail/index.ts';
import { client } from '../../client/index.ts';
import { FLOW_COOKIE, FLOW_MAX_AGE, TABLE_NAME } from '../../constants.ts';
import { localCookie } from '../../localCookie/index.ts';
import { subFromEmail } from '../../subFromEmail/index.ts';

const exists = async (Key: { PK: string; SK: string }): Promise<boolean> =>
  (await client.send(new GetCommand({ TableName: TABLE_NAME, Key }))).Item !== undefined;

export const start = async (event: AuthRequest): Promise<APIGatewayProxyStructuredResultV2> => {
  const email = normaliseEmail(readBodyField(event, 'email'));
  if (!email.includes('@')) {
    return { statusCode: 400 };
  }
  const known = (await exists(profileKey(subFromEmail(email)))) || (await exists(inviteKey(email)));
  if (!known) {
    return jsonResponse(403, { reason: 'no-invite' });
  }
  return {
    statusCode: 204,
    cookies: [localCookie(FLOW_COOKIE, Buffer.from(email).toString('base64url'), FLOW_MAX_AGE)],
  };
};
