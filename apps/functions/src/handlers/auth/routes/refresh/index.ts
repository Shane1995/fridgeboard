import {
  CognitoIdentityProviderClient,
  GetTokensFromRefreshTokenCommand,
  NotAuthorizedException,
} from '@aws-sdk/client-cognito-identity-provider';
import type { Route } from '../../types.ts';
import { REFRESH_COOKIE, REFRESH_MAX_AGE } from '../../utils/cookies/constants.ts';
import { clearCookie, readCookie, serialiseCookie } from '../../utils/cookies/index.ts';
import { jsonResponse } from '../../utils/jsonResponse/index.ts';
import { MISSING_TOKENS_ERROR } from './constants.ts';

const cognito = new CognitoIdentityProviderClient({});

export const refresh: Route = async (request, { clientId, clientSecret }) => {
  const unauthorised = jsonResponse(401, { reason: 'unauthorised' }, [clearCookie(REFRESH_COOKIE)]);

  const token = readCookie(request.cookies, REFRESH_COOKIE);
  if (!token) {
    return unauthorised;
  }

  const result = await cognito
    .send(
      new GetTokensFromRefreshTokenCommand({
        ClientId: clientId,
        ClientSecret: clientSecret,
        RefreshToken: token,
      }),
    )
    .catch((error: unknown) => {
      if (error instanceof NotAuthorizedException) {
        return undefined;
      }
      throw error;
    });
  if (!result) {
    return unauthorised;
  }

  const { AccessToken, ExpiresIn, RefreshToken } = result.AuthenticationResult ?? {};
  if (!AccessToken || !RefreshToken || ExpiresIn === undefined) {
    throw new Error(MISSING_TOKENS_ERROR);
  }

  return jsonResponse(200, { accessToken: AccessToken, expiresIn: ExpiresIn }, [
    serialiseCookie(REFRESH_COOKIE, RefreshToken, REFRESH_MAX_AGE),
  ]);
};
