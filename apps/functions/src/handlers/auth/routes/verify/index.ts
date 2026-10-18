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
import type { Route } from '../../types.ts';
import {
  FLOW_COOKIE,
  FLOW_MAX_AGE,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE,
} from '../../utils/cookies/constants.ts';
import { clearCookie, readCookie, serialiseCookie } from '../../utils/cookies/index.ts';
import { openFlow, sealFlow } from '../../utils/flowToken/index.ts';
import { jsonResponse } from '../../utils/jsonResponse/index.ts';
import { readBodyField } from '../../utils/readBodyField/index.ts';
import { secretHash } from '../../utils/secretHash/index.ts';
import { MISSING_SESSION_ERROR, MISSING_TOKENS_ERROR } from './constants.ts';

const cognito = new CognitoIdentityProviderClient({});

export const verify: Route = async (request, { clientId, clientSecret, flowKey }) => {
  const expired = jsonResponse(400, { reason: 'expired' }, [clearCookie(FLOW_COOKIE)]);
  const badCode = jsonResponse(400, { reason: 'bad-code' });

  const flow = openFlow(readCookie(request.cookies, FLOW_COOKIE) ?? '', flowKey, Date.now());
  if (!flow) {
    return expired;
  }

  const code = readBodyField(request, 'code');
  if (!code) {
    return badCode;
  }

  const { email: Username, session, kind } = flow;
  const SecretHash = secretHash(Username, clientId, clientSecret);

  try {
    const confirmedSession =
      kind === 'sign-up'
        ? (
            await cognito.send(
              new ConfirmSignUpCommand({
                ClientId: clientId,
                SecretHash,
                Username,
                ConfirmationCode: code,
                Session: session || undefined,
              }),
            )
          ).Session
        : undefined;

    if (kind === 'sign-up' && !confirmedSession) {
      const { Session } = await cognito.send(
        new InitiateAuthCommand({
          AuthFlow: 'USER_AUTH',
          ClientId: clientId,
          AuthParameters: {
            USERNAME: Username,
            PREFERRED_CHALLENGE: 'EMAIL_OTP',
            SECRET_HASH: SecretHash,
          },
        }),
      );
      if (!Session) {
        throw new Error(MISSING_SESSION_ERROR);
      }
      const next = sealFlow(
        { email: Username, session: Session, kind: 'sign-in' },
        flowKey,
        Date.now(),
      );
      return jsonResponse(202, { next: 'enter-code' }, [
        serialiseCookie(FLOW_COOKIE, next, FLOW_MAX_AGE),
      ]);
    }

    const { AuthenticationResult } = confirmedSession
      ? await cognito.send(
          new InitiateAuthCommand({
            AuthFlow: 'USER_AUTH',
            ClientId: clientId,
            AuthParameters: { USERNAME: Username, SECRET_HASH: SecretHash },
            Session: confirmedSession,
          }),
        )
      : await cognito.send(
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

    const { AccessToken, ExpiresIn, RefreshToken } = AuthenticationResult ?? {};
    if (!AccessToken || !RefreshToken || ExpiresIn === undefined) {
      throw new Error(MISSING_TOKENS_ERROR);
    }

    return jsonResponse(200, { accessToken: AccessToken, expiresIn: ExpiresIn }, [
      serialiseCookie(REFRESH_COOKIE, RefreshToken, REFRESH_MAX_AGE),
      clearCookie(FLOW_COOKIE),
    ]);
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
