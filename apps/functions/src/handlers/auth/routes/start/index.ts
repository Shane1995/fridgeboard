import {
  AdminGetUserCommand,
  CognitoIdentityProviderClient,
  ResendConfirmationCodeCommand,
  SignUpCommand,
  UserLambdaValidationException,
  UserNotFoundException,
} from '@aws-sdk/client-cognito-identity-provider';
import { GetEmailIdentityCommand, NotFoundException, SESv2Client } from '@aws-sdk/client-sesv2';
import { normaliseEmail } from '../../../../utils/normaliseEmail/index.ts';
import { getConfiguration } from '../../../../configuration/index.ts';
import { NO_INVITE_ERROR } from '../../../preSignUp/constants.ts';
import type { Route } from '../../types.ts';
import { FLOW_COOKIE } from '../../utils/cookies/constants.ts';
import { readCookie } from '../../utils/cookies/readCookie/index.ts';
import { emailOtpSignIn } from '../../utils/emailOtpSignIn/index.ts';
import { flowResponse } from '../../utils/flowResponse/index.ts';
import { openFlow } from '../../utils/flowToken/openFlow/index.ts';
import { jsonResponse } from '../../../../utils/jsonResponse/index.ts';
import { readBodyField } from '../../utils/readBodyField/index.ts';
import { secretHash } from '../../utils/secretHash/index.ts';
import { EMAIL_ATTRIBUTE, EMAIL_MARKER, UNCONFIRMED_STATUS, USER_NOT_FOUND } from './constants.ts';

const cognito = new CognitoIdentityProviderClient({});
const ses = new SESv2Client({});

export const start: Route = async (request, { userPoolId, clientId, clientSecret, flowKey }) => {
  const email = normaliseEmail(readBodyField(request, 'email'));
  if (!email.includes(EMAIL_MARKER)) {
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
  const { flowTtlMs } = (await getConfiguration()).settings;

  if (status === USER_NOT_FOUND) {
    const signUp = await cognito
      .send(
        new SignUpCommand({
          ClientId: clientId,
          SecretHash,
          Username: email,
          UserAttributes: [{ Name: EMAIL_ATTRIBUTE, Value: email }],
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
    return flowResponse(
      { email, session: signUp.Session ?? '', kind: 'sign-up' },
      flowKey,
      flowTtlMs,
    );
  }

  if (status === UNCONFIRMED_STATUS) {
    await cognito.send(
      new ResendConfirmationCodeCommand({ ClientId: clientId, SecretHash, Username: email }),
    );
    const previous = openFlow(readCookie(request.cookies, FLOW_COOKIE) ?? '', flowKey, Date.now());
    const session =
      previous?.email === email && previous.kind === 'sign-up' ? previous.session : '';
    return flowResponse({ email, session, kind: 'sign-up' }, flowKey, flowTtlMs);
  }

  const session = await emailOtpSignIn({ clientId, username: email, secretHash: SecretHash });
  return flowResponse({ email, session, kind: 'sign-in' }, flowKey, flowTtlMs);
};
