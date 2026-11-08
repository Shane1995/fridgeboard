import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { mockClient } from 'aws-sdk-client-mock';
import { emailOtpSignIn } from './index.ts';

const cognitoMock = mockClient(CognitoIdentityProviderClient);

const INPUT = { clientId: 'client-123', username: 'jess@example.com', secretHash: 'hash' };

describe('emailOtpSignIn', () => {
  beforeEach(() => {
    cognitoMock.reset();
  });

  it('starts an EMAIL_OTP sign-in and returns the session', async () => {
    cognitoMock.on(InitiateAuthCommand).resolves({ Session: 's1' });

    await expect(emailOtpSignIn(INPUT)).resolves.toBe('s1');
    expect(cognitoMock.commandCalls(InitiateAuthCommand)[0]?.args[0].input).toEqual({
      AuthFlow: 'USER_AUTH',
      ClientId: 'client-123',
      AuthParameters: {
        USERNAME: 'jess@example.com',
        PREFERRED_CHALLENGE: 'EMAIL_OTP',
        SECRET_HASH: 'hash',
      },
    });
  });

  it('throws when Cognito returns no session', async () => {
    cognitoMock.on(InitiateAuthCommand).resolves({});

    await expect(emailOtpSignIn(INPUT)).rejects.toThrow('MISSING_SESSION');
  });
});
