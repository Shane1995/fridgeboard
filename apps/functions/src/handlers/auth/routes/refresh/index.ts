import {
  CognitoIdentityProviderClient,
  GetTokensFromRefreshTokenCommand,
  NotAuthorizedException,
  RefreshTokenReuseException,
  UserNotFoundException,
} from '@aws-sdk/client-cognito-identity-provider';
import type { Route } from '../../types.ts';
import { REFRESH_COOKIE } from '../../utils/cookies/constants.ts';
import { clearCookie } from '../../utils/cookies/clearCookie/index.ts';
import { readCookie } from '../../utils/cookies/readCookie/index.ts';
import { jsonResponse } from '../../../../utils/jsonResponse/index.ts';
import { sessionResponse } from '../../utils/sessionResponse/index.ts';

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
      if (
        error instanceof NotAuthorizedException ||
        error instanceof RefreshTokenReuseException ||
        error instanceof UserNotFoundException
      ) {
        return undefined;
      }
      throw error;
    });
  if (!result) {
    return unauthorised;
  }

  return sessionResponse(result.AuthenticationResult);
};
