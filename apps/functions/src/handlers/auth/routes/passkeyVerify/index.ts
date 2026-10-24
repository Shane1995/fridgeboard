import {
  CognitoIdentityProviderClient,
  ExpiredCodeException,
  NotAuthorizedException,
  RespondToAuthChallengeCommand,
  TooManyFailedAttemptsException,
} from '@aws-sdk/client-cognito-identity-provider';
import { jsonResponse } from '../../../../utils/jsonResponse/index.ts';
import { CREDENTIAL_FIELD, WEB_AUTHN_CHALLENGE } from '../../constants.ts';
import type { Route } from '../../types.ts';
import { FLOW_COOKIE } from '../../utils/cookies/constants.ts';
import { clearCookie } from '../../utils/cookies/clearCookie/index.ts';
import { readCookie } from '../../utils/cookies/readCookie/index.ts';
import { openFlow } from '../../utils/flowToken/openFlow/index.ts';
import { readBodyObject } from '../../utils/readBodyObject/index.ts';
import { secretHash } from '../../utils/secretHash/index.ts';
import { sessionResponse } from '../../utils/sessionResponse/index.ts';
import { AuthFlowKind } from '../../utils/flowToken/constants.ts';

const cognito = new CognitoIdentityProviderClient({});

export const passkeyVerify: Route = async (request, { clientId, clientSecret, flowKey }) => {
  const flow = openFlow(readCookie(request.cookies, FLOW_COOKIE) ?? '', flowKey, Date.now());
  if (flow?.kind !== AuthFlowKind.Passkey) {
    return jsonResponse(400, { reason: 'expired' }, [clearCookie(FLOW_COOKIE)]);
  }

  const credential = readBodyObject(request, CREDENTIAL_FIELD);
  if (!credential) {
    return jsonResponse(400, { reason: 'passkey-failed' });
  }

  const { email: Username, session } = flow;
  try {
    const { AuthenticationResult } = await cognito.send(
      new RespondToAuthChallengeCommand({
        ClientId: clientId,
        ChallengeName: WEB_AUTHN_CHALLENGE,
        Session: session,
        ChallengeResponses: {
          USERNAME: Username,
          CREDENTIAL: JSON.stringify(credential),
          SECRET_HASH: secretHash(Username, clientId, clientSecret),
        },
      }),
    );
    return sessionResponse(AuthenticationResult, [clearCookie(FLOW_COOKIE)]);
  } catch (error) {
    if (
      error instanceof NotAuthorizedException ||
      error instanceof ExpiredCodeException ||
      error instanceof TooManyFailedAttemptsException
    ) {
      return jsonResponse(400, { reason: 'passkey-failed' }, [clearCookie(FLOW_COOKIE)]);
    }
    throw error;
  }
};
