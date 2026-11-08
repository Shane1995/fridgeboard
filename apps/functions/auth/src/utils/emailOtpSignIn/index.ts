import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { MISSING_SESSION_ERROR } from './constants.ts';
import type { EmailOtpSignInInput } from './types.ts';

const cognito = new CognitoIdentityProviderClient({});

export const emailOtpSignIn = async ({
  clientId,
  username,
  secretHash,
}: EmailOtpSignInInput): Promise<string> => {
  const { Session } = await cognito.send(
    new InitiateAuthCommand({
      AuthFlow: 'USER_AUTH',
      ClientId: clientId,
      AuthParameters: {
        USERNAME: username,
        PREFERRED_CHALLENGE: 'EMAIL_OTP',
        SECRET_HASH: secretHash,
      },
    }),
  );
  if (!Session) {
    throw new Error(MISSING_SESSION_ERROR);
  }
  return Session;
};
