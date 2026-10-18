import {
  AdminGetUserCommand,
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  ResendConfirmationCodeCommand,
  SignUpCommand,
  UserLambdaValidationException,
  UserNotFoundException,
} from '@aws-sdk/client-cognito-identity-provider';
import { GetEmailIdentityCommand, NotFoundException, SESv2Client } from '@aws-sdk/client-sesv2';
import { normaliseEmail } from '../../../../utils/normaliseEmail/index.ts';
import { NO_INVITE_ERROR } from '../../../preSignUp/constants.ts';
import type { Route } from '../../types.ts';
import { FLOW_COOKIE, FLOW_MAX_AGE } from '../../utils/cookies/constants.ts';
import { serialiseCookie } from '../../utils/cookies/index.ts';
import { signFlow } from '../../utils/flowToken/index.ts';
import type { AuthFlow } from '../../utils/flowToken/index.ts';
import { jsonResponse } from '../../utils/jsonResponse/index.ts';
import { readBodyField } from '../../utils/readBodyField/index.ts';
import { secretHash } from '../../utils/secretHash/index.ts';
import { MISSING_SESSION_ERROR, USER_NOT_FOUND } from './constants.ts';

const cognito = new CognitoIdentityProviderClient({});
const ses = new SESv2Client({});

export const start: Route = async (request, { userPoolId, clientId, clientSecret, flowKey }) => {
  const email = normaliseEmail(readBodyField(request, 'email'));
  if (!email) {
    return { statusCode: 400 };
  }

  const verified = await ses
    .send(new GetEmailIdentityCommand({ EmailIdentity: email }))
    .then(({ VerifiedForSendingStatus }) => VerifiedForSendingStatus === true)
    .catch((error: unknown) => {
      if (error instanceof NotFoundException) {
        return false;
      }
      throw error;
    });
  if (!verified) {
    return jsonResponse(409, { reason: 'verify-email' });
  }

  const status = await cognito
    .send(new AdminGetUserCommand({ UserPoolId: userPoolId, Username: email }))
    .then(({ UserStatus }) => UserStatus)
    .catch((error: unknown) => {
      if (error instanceof UserNotFoundException) {
        return USER_NOT_FOUND;
      }
      throw error;
    });

  const SecretHash = secretHash(email, clientId, clientSecret);
  const withFlow = (flow: AuthFlow) => ({
    statusCode: 204,
    cookies: [serialiseCookie(FLOW_COOKIE, signFlow(flow, flowKey, Date.now()), FLOW_MAX_AGE)],
  });

  if (status === USER_NOT_FOUND) {
    const signUp = await cognito
      .send(
        new SignUpCommand({
          ClientId: clientId,
          SecretHash,
          Username: email,
          UserAttributes: [{ Name: 'email', Value: email }],
        }),
      )
      .catch((error: unknown) => {
        if (
          error instanceof UserLambdaValidationException &&
          error.message.includes(NO_INVITE_ERROR)
        ) {
          return undefined;
        }
        throw error;
      });
    if (!signUp) {
      return jsonResponse(403, { reason: 'no-invite' });
    }
    return withFlow({ email, session: signUp.Session ?? '', kind: 'sign-up' });
  }

  if (status === 'UNCONFIRMED') {
    await cognito.send(
      new ResendConfirmationCodeCommand({ ClientId: clientId, SecretHash, Username: email }),
    );
    return withFlow({ email, session: '', kind: 'sign-up' });
  }

  const { Session } = await cognito.send(
    new InitiateAuthCommand({
      AuthFlow: 'USER_AUTH',
      ClientId: clientId,
      AuthParameters: {
        USERNAME: email,
        PREFERRED_CHALLENGE: 'EMAIL_OTP',
        SECRET_HASH: SecretHash,
      },
    }),
  );
  if (!Session) {
    throw new Error(MISSING_SESSION_ERROR);
  }
  return withFlow({ email, session: Session, kind: 'sign-in' });
};
