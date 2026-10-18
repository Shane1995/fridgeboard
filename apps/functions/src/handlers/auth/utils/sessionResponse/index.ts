import type { AuthenticationResultType } from '@aws-sdk/client-cognito-identity-provider';
import type { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { REFRESH_COOKIE, REFRESH_MAX_AGE } from '../cookies/constants.ts';
import { serialiseCookie } from '../cookies/index.ts';
import { jsonResponse } from '../jsonResponse/index.ts';
import { MISSING_TOKENS_ERROR } from './constants.ts';

export const sessionResponse = (
  result: AuthenticationResultType | undefined,
  extraCookies: string[] = [],
): APIGatewayProxyStructuredResultV2 => {
  const { AccessToken, ExpiresIn, RefreshToken } = result ?? {};
  if (!AccessToken || !RefreshToken || ExpiresIn === undefined) {
    throw new Error(MISSING_TOKENS_ERROR);
  }

  return jsonResponse(200, { accessToken: AccessToken, expiresIn: ExpiresIn }, [
    serialiseCookie(REFRESH_COOKIE, RefreshToken, REFRESH_MAX_AGE),
    ...extraCookies,
  ]);
};
