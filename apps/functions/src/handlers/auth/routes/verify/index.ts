import {
  CodeMismatchException,
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
  ExpiredCodeException,
  InitiateAuthCommand,
  NotAuthorizedException,
  RespondToAuthChallengeCommand,
  TooManyFailedAttemptsException,
  UserNotFoundException,
} from '@aws-sdk/client-cognito-identity-provider';
import { getConfiguration } from '../../../../configuration/index.ts';
import type { Route } from '../../types.ts';
import { FLOW_COOKIE } from '../../utils/cookies/constants.ts';
import { clearCookie } from '../../utils/cookies/clearCookie/index.ts';
import { readCookie } from '../../utils/cookies/readCookie/index.ts';
import { serialiseCookie } from '../../utils/cookies/serialiseCookie/index.ts';
import { flowMaxAge } from '../../utils/flowMaxAge/index.ts';
import { emailOtpSignIn } from '../../utils/emailOtpSignIn/index.ts';
import { openFlow } from '../../utils/flowToken/openFlow/index.ts';
import { sealFlow } from '../../utils/flowToken/sealFlow/index.ts';
import { jsonResponse } from '../../../../utils/jsonResponse/index.ts';
import { readBodyField } from '../../utils/readBodyField/index.ts';
import { secretHash } from '../../utils/secretHash/index.ts';
import { sessionResponse } from '../../utils/sessionResponse/index.ts';

const cognito = new CognitoIdentityProviderClient({});

export const verify: Route = async (request, { clientId, clientSecret, flowKey }) => {
  const expired = jsonResponse(400, { reason: 'expired' }, [clearCookie(FLOW_COOKIE)]);
  const badCode = jsonResponse(400, { reason: 'bad-code' });

  const flow = openFlow(readCookie(request.cookies, FLOW_COOKIE) ?? '', flowKey, Date.now());
  if (!flow) {
    return expired;
  }

  if (flow.kind === 'passkey') {
    return expired;
  }

  const code = readBodyField(request, 'code');
  if (!code) {
    return badCode;
  }

  const { email: Username, session, kind } = flow;
  const SecretHash = secretHash(Username, clientId, clientSecret);

  try {
    if (kind === 'sign-up') {
      const { Session: confirmedSession } = await cognito.send(
        new ConfirmSignUpCommand({
          ClientId: clientId,
          SecretHash,
          Username,
          ConfirmationCode: code,
          Session: session || undefined,
        }),
      );

      if (!confirmedSession) {
        const signInSession = await emailOtpSignIn({
          clientId,
          username: Username,
          secretHash: SecretHash,
        });
        const { flowTtlMs } = (await getConfiguration()).settings;
        const next = sealFlow(
          { email: Username, session: signInSession, kind: 'sign-in' },
          flowKey,
          Date.now(),
          flowTtlMs,
        );
        return jsonResponse(202, { next: 'enter-code' }, [
          serialiseCookie(FLOW_COOKIE, next, flowMaxAge(flowTtlMs)),
        ]);
      }

      const { AuthenticationResult } = await cognito.send(
        new InitiateAuthCommand({
          AuthFlow: 'USER_AUTH',
          ClientId: clientId,
          AuthParameters: { USERNAME: Username, SECRET_HASH: SecretHash },
          Session: confirmedSession,
        }),
      );
      return sessionResponse(AuthenticationResult, [clearCookie(FLOW_COOKIE)]);
    }

    const { AuthenticationResult } = await cognito.send(
      new RespondToAuthChallengeCommand({
        ClientId: clientId,
        ChallengeName: 'EMAIL_OTP',
        Session: session,
        ChallengeResponses: {
          USERNAME: Username,
          EMAIL_OTP_CODE: code,
          SECRET_HASH: SecretHash,
        },
      }),
    );
    return sessionResponse(AuthenticationResult, [clearCookie(FLOW_COOKIE)]);
  } catch (error) {
    if (error instanceof CodeMismatchException) {
      return badCode;
    }
    if (
      error instanceof ExpiredCodeException ||
      error instanceof NotAuthorizedException ||
      error instanceof TooManyFailedAttemptsException ||
      error instanceof UserNotFoundException
    ) {
      return expired;
    }
    throw error;
  }
};
