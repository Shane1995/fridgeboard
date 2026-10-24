import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  NotAuthorizedException,
  UserNotFoundException,
} from '@aws-sdk/client-cognito-identity-provider';
import { getConfiguration } from '../../../../configuration/index.ts';
import { jsonResponse } from '../../../../utils/jsonResponse/index.ts';
import { normaliseEmail } from '../../../../utils/normaliseEmail/index.ts';
import { WEB_AUTHN_CHALLENGE } from '../../constants.ts';
import type { Route } from '../../types.ts';
import { flowCookie } from '../../utils/flowCookie/index.ts';
import { readBodyField } from '../../utils/readBodyField/index.ts';
import { secretHash } from '../../utils/secretHash/index.ts';
import { EMAIL_MARKER, REQUEST_OPTIONS_PARAMETER } from './constants.ts';
import { parseOptions } from './utils/parseOptions/index.ts';
import { AuthFlowKind } from '../../utils/flowToken/constants.ts';

const cognito = new CognitoIdentityProviderClient({});

const emailCode = jsonResponse(200, { next: 'email-code' });

export const passkeyStart: Route = async (request, { clientId, clientSecret, flowKey }) => {
  const email = normaliseEmail(readBodyField(request, 'email'));
  if (!email.includes(EMAIL_MARKER)) {
    return { statusCode: 400 };
  }

  const response = await cognito
    .send(
      new InitiateAuthCommand({
        AuthFlow: 'USER_AUTH',
        ClientId: clientId,
        AuthParameters: {
          USERNAME: email,
          PREFERRED_CHALLENGE: WEB_AUTHN_CHALLENGE,
          SECRET_HASH: secretHash(email, clientId, clientSecret),
        },
      }),
    )
    .catch((error: unknown) => {
      if (error instanceof UserNotFoundException || error instanceof NotAuthorizedException) {
        return undefined;
      }
      throw error;
    });

  const options = parseOptions(response?.ChallengeParameters?.[REQUEST_OPTIONS_PARAMETER]);
  if (response?.ChallengeName !== WEB_AUTHN_CHALLENGE || !response.Session || !options) {
    return emailCode;
  }

  const { flowTtlMs } = (await getConfiguration()).settings;
  return jsonResponse(200, { options }, [
    flowCookie(
      { email, session: response.Session, kind: AuthFlowKind.Passkey },
      flowKey,
      flowTtlMs,
    ),
  ]);
};
