import {
  CognitoIdentityProviderClient,
  NotAuthorizedException,
  StartWebAuthnRegistrationCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import type { WebAuthnOptions } from '@fridgeboard/contract/auth';
import { jsonResponse } from '../../../../utils/jsonResponse/index.ts';
import type { AuthorizedRoute } from '../../types.ts';
import { bearerToken } from '../../utils/bearerToken/index.ts';
import { isRecentAuth } from '../../utils/recentAuth/index.ts';

const cognito = new CognitoIdentityProviderClient({});

export const passkeysStart: AuthorizedRoute = async (request) => {
  if (!isRecentAuth(request.requestContext.authorizer.jwt.claims, Date.now())) {
    return jsonResponse(403, { reason: 'recent-code-required' });
  }

  const AccessToken = bearerToken(request.headers);
  if (!AccessToken) {
    return jsonResponse(401, { reason: 'unauthorised' });
  }

  try {
    const { CredentialCreationOptions } = await cognito.send(
      new StartWebAuthnRegistrationCommand({ AccessToken }),
    );
    const options: WebAuthnOptions = Object.fromEntries(
      Object.entries(CredentialCreationOptions ?? {}),
    );
    return jsonResponse(200, { options });
  } catch (error) {
    if (error instanceof NotAuthorizedException) {
      return jsonResponse(401, { reason: 'unauthorised' });
    }
    throw error;
  }
};
