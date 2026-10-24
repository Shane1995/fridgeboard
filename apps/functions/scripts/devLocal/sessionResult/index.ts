import type { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { jsonResponse } from '../../../src/utils/jsonResponse/index.ts';
import { FLOW_COOKIE, REFRESH_COOKIE, REFRESH_MAX_AGE, TOKEN_EXPIRES_IN } from '../constants.ts';
import { claimsFor } from '../claimsFor/index.ts';
import { encodeToken } from '../encodeToken/index.ts';
import { localCookie } from '../localCookie/index.ts';

export const sessionResult = (email: string): APIGatewayProxyStructuredResultV2 => {
  const token = encodeToken(claimsFor(email));
  return jsonResponse(200, { accessToken: token, expiresIn: TOKEN_EXPIRES_IN }, [
    localCookie(REFRESH_COOKIE, token, REFRESH_MAX_AGE),
    localCookie(FLOW_COOKIE, '', 0),
  ]);
};
