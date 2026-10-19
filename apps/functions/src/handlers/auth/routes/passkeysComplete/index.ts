import {
  CognitoIdentityProviderClient,
  CompleteWebAuthnRegistrationCommand,
  GetUserCommand,
  NotAuthorizedException,
  WebAuthnChallengeNotFoundException,
  WebAuthnClientMismatchException,
  WebAuthnCredentialNotSupportedException,
  WebAuthnOriginNotAllowedException,
  WebAuthnRelyingPartyMismatchException,
} from '@aws-sdk/client-cognito-identity-provider';
import { jsonResponse } from '../../../../utils/jsonResponse/index.ts';
import type { AuthorizedRoute } from '../../types.ts';
import { bearerToken } from '../../utils/bearerToken/index.ts';
import { isRecentAuth } from '../../utils/recentAuth/index.ts';
import { readBodyObject } from '../../utils/readBodyObject/index.ts';
import { sendPasskeyNotice } from '../../utils/sendPasskeyNotice/index.ts';
import {
  CREDENTIAL_FIELD,
  EMAIL_ATTRIBUTE,
  NOTICE_FAILED_LOG,
  UNKNOWN_ERROR,
} from './constants.ts';

const cognito = new CognitoIdentityProviderClient({});

const isRegistrationRejection = (error: unknown): boolean =>
  error instanceof WebAuthnChallengeNotFoundException ||
  error instanceof WebAuthnClientMismatchException ||
  error instanceof WebAuthnCredentialNotSupportedException ||
  error instanceof WebAuthnOriginNotAllowedException ||
  error instanceof WebAuthnRelyingPartyMismatchException;

export const passkeysComplete: AuthorizedRoute = async (request) => {
  if (!isRecentAuth(request.requestContext.authorizer.jwt.claims, Date.now())) {
    return jsonResponse(403, { reason: 'recent-code-required' });
  }

  const AccessToken = bearerToken(request.headers);
  if (!AccessToken) {
    return jsonResponse(401, { reason: 'unauthorised' });
  }

  const Credential = readBodyObject(request, CREDENTIAL_FIELD);
  if (!Credential) {
    return jsonResponse(400, { reason: 'passkey-failed' });
  }

  try {
    await cognito.send(new CompleteWebAuthnRegistrationCommand({ AccessToken, Credential }));
  } catch (error) {
    if (error instanceof NotAuthorizedException) {
      return jsonResponse(401, { reason: 'unauthorised' });
    }
    if (isRegistrationRejection(error)) {
      return jsonResponse(400, { reason: 'passkey-failed' });
    }
    throw error;
  }

  try {
    const { UserAttributes = [] } = await cognito.send(new GetUserCommand({ AccessToken }));
    const email = UserAttributes.find(({ Name }) => Name === EMAIL_ATTRIBUTE)?.Value;
    if (email) {
      await sendPasskeyNotice(email);
    }
  } catch (error) {
    console.error(NOTICE_FAILED_LOG, error instanceof Error ? error.name : UNKNOWN_ERROR);
  }

  return { statusCode: 204 };
};
