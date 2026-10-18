import {
  CognitoIdentityProviderClient,
  InvalidParameterException,
  RevokeTokenCommand,
  UnauthorizedException,
  UnsupportedTokenTypeException,
} from '@aws-sdk/client-cognito-identity-provider';
import type { Route } from '../../types.ts';
import { REFRESH_COOKIE } from '../../utils/cookies/constants.ts';
import { clearCookie } from '../../utils/cookies/clearCookie/index.ts';
import { readCookie } from '../../utils/cookies/readCookie/index.ts';

const cognito = new CognitoIdentityProviderClient({});

export const signOut: Route = async (request, { clientId, clientSecret }) => {
  const token = readCookie(request.cookies, REFRESH_COOKIE);
  if (token) {
    await cognito
      .send(
        new RevokeTokenCommand({ ClientId: clientId, ClientSecret: clientSecret, Token: token }),
      )
      .catch((error: unknown) => {
        if (
          !(
            error instanceof UnsupportedTokenTypeException ||
            error instanceof InvalidParameterException ||
            error instanceof UnauthorizedException
          )
        ) {
          throw error;
        }
      });
  }

  return { statusCode: 204, cookies: [clearCookie(REFRESH_COOKIE)] };
};
