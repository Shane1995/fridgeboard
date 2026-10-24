import type { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import type { AuthRequest } from '../../../../src/handlers/auth/types.ts';
import { readCookie } from '../../../../src/handlers/auth/utils/cookies/readCookie/index.ts';
import { jsonResponse } from '../../../../src/utils/jsonResponse/index.ts';
import { REFRESH_COOKIE } from '../../constants.ts';
import { decodeToken } from '../../decodeToken/index.ts';
import { localCookie } from '../../localCookie/index.ts';
import { sessionResult } from '../../sessionResult/index.ts';

export const refresh = async (event: AuthRequest): Promise<APIGatewayProxyStructuredResultV2> => {
  const claims = decodeToken(readCookie(event.cookies, REFRESH_COOKIE));
  return claims
    ? sessionResult(claims.email)
    : jsonResponse(401, { reason: 'unauthorised' }, [localCookie(REFRESH_COOKIE, '', 0)]);
};
