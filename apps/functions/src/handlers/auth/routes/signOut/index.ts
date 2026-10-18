import {
  CognitoIdentityProviderClient,
  NotAuthorizedException,
  RevokeTokenCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import type { Route } from '../../types.ts';
import { REFRESH_COOKIE } from '../../utils/cookies/constants.ts';
import { clearCookie, readCookie } from '../../utils/cookies/index.ts';

const cognito = new CognitoIdentityProviderClient({});

export const signOut: Route = async (request, { clientId, clientSecret }) => {
  const token = readCookie(request.cookies, REFRESH_COOKIE);
  if (token) {
    await cognito
      .send(
        new RevokeTokenCommand({ ClientId: clientId, ClientSecret: clientSecret, Token: token }),
      )
      .catch((error: unknown) => {
        if (!(error instanceof NotAuthorizedException)) {
          throw error;
        }
      });
  }

  return { statusCode: 204, cookies: [clearCookie(REFRESH_COOKIE)] };
};
