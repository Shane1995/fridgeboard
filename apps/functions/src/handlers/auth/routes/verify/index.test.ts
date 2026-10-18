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
import { mockClient } from 'aws-sdk-client-mock';
import { openFlow, sealFlow } from '../../utils/flowToken/index.ts';
import { readCookie } from '../../utils/cookies/index.ts';
import type { AuthFlow } from '../../utils/flowToken/types.ts';
import { verify } from './index.ts';

const cognitoMock = mockClient(CognitoIdentityProviderClient);

const SECRETS = {
  userPoolId: 'pool-1',
  clientId: 'client-123',
  clientSecret: 'secret-abc',
  flowKey: 'flow-key',
};
const SECRET_HASH = 'n0vvPRSy+pkUqGp/4Nml7yskNIP+ZFAOLepv183K42g=';
const SIGN_UP: AuthFlow = { email: 'jess@example.com', session: 's1', kind: 'sign-up' };
const SIGN_IN: AuthFlow = { email: 'jess@example.com', session: 's2', kind: 'sign-in' };
const TOKENS = { AccessToken: 'access-1', ExpiresIn: 900, RefreshToken: 'refresh-1' };
const REFRESH_COOKIE =
  'fb_rt=refresh-1; Secure; HttpOnly; SameSite=Strict; Path=/api/v1/auth; Max-Age=315360000';
const CLEARED_FLOW_COOKIE =
  'fb_auth_flow=; Secure; HttpOnly; SameSite=Strict; Path=/api/v1/auth; Max-Age=0';

const buildRequest = (flow: AuthFlow, issuedAt = Date.now()) => ({
  body: JSON.stringify({ code: '123456' }),
  isBase64Encoded: false,
  cookies: [`fb_auth_flow=${sealFlow(flow, SECRETS.flowKey, issuedAt)}`],
});

describe('verify route', () => {
  beforeEach(() => {
    cognitoMock.reset();
  });

  it('confirms sign-up and signs in with the returned session', async () => {
    cognitoMock.on(ConfirmSignUpCommand).resolves({ Session: 's3' });
    cognitoMock.on(InitiateAuthCommand).resolves({ AuthenticationResult: TOKENS });

    const result = await verify(buildRequest(SIGN_UP), SECRETS);

    expect(cognitoMock.commandCalls(ConfirmSignUpCommand)).toHaveLength(1);
    expect(cognitoMock.commandCalls(InitiateAuthCommand)).toHaveLength(1);
    expect(cognitoMock.commandCalls(ConfirmSignUpCommand)[0]?.args[0].input).toEqual({
      ClientId: 'client-123',
      SecretHash: SECRET_HASH,
      Username: 'jess@example.com',
      ConfirmationCode: '123456',
      Session: 's1',
    });
    expect(cognitoMock.commandCalls(InitiateAuthCommand)[0]?.args[0].input).toEqual({
      AuthFlow: 'USER_AUTH',
      ClientId: 'client-123',
      AuthParameters: { USERNAME: 'jess@example.com', SECRET_HASH: SECRET_HASH },
      Session: 's3',
    });
    expect(result.statusCode).toBe(200);
    expect(result.headers).toEqual({ 'content-type': 'application/json' });
    expect(JSON.parse(result.body ?? '')).toEqual({ accessToken: 'access-1', expiresIn: 900 });
    expect(result.cookies).toEqual([REFRESH_COOKIE, CLEARED_FLOW_COOKIE]);
  });

  it('answers the EMAIL_OTP challenge for sign-in', async () => {
    cognitoMock.on(RespondToAuthChallengeCommand).resolves({ AuthenticationResult: TOKENS });

    const result = await verify(buildRequest(SIGN_IN), SECRETS);

    expect(cognitoMock.commandCalls(RespondToAuthChallengeCommand)[0]?.args[0].input).toEqual({
      ClientId: 'client-123',
      ChallengeName: 'EMAIL_OTP',
      Session: 's2',
      ChallengeResponses: {
        USERNAME: 'jess@example.com',
        EMAIL_OTP_CODE: '123456',
        SECRET_HASH: SECRET_HASH,
      },
    });
    expect(result.statusCode).toBe(200);
    expect(result.cookies).toEqual([REFRESH_COOKIE, CLEARED_FLOW_COOKIE]);
  });

  it('returns 400 bad-code on CodeMismatchException', async () => {
    cognitoMock
      .on(RespondToAuthChallengeCommand)
      .rejects(new CodeMismatchException({ message: 'wrong', $metadata: {} }));

    const result = await verify(buildRequest(SIGN_IN), SECRETS);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'bad-code' });
    expect(result.cookies).toEqual([]);
  });

  it('returns 400 expired on ExpiredCodeException', async () => {
    cognitoMock
      .on(ConfirmSignUpCommand)
      .rejects(new ExpiredCodeException({ message: 'old', $metadata: {} }));

    const result = await verify(buildRequest(SIGN_UP), SECRETS);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'expired' });
    expect(result.cookies).toEqual([CLEARED_FLOW_COOKIE]);
  });

  it('returns 400 expired when Cognito rejects a stale session', async () => {
    cognitoMock
      .on(RespondToAuthChallengeCommand)
      .rejects(new NotAuthorizedException({ message: 'Invalid session', $metadata: {} }));

    const result = await verify(buildRequest(SIGN_IN), SECRETS);

    expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'expired' });
  });

  it('starts an EMAIL_OTP sign-in when confirmation gives no session', async () => {
    cognitoMock.on(ConfirmSignUpCommand).resolves({});
    cognitoMock.on(InitiateAuthCommand).resolves({ ChallengeName: 'EMAIL_OTP', Session: 's4' });

    const result = await verify(buildRequest({ ...SIGN_UP, session: '' }), SECRETS);

    expect(
      cognitoMock.commandCalls(ConfirmSignUpCommand)[0]?.args[0].input.Session,
    ).toBeUndefined();
    expect(cognitoMock.commandCalls(InitiateAuthCommand)[0]?.args[0].input).toEqual({
      AuthFlow: 'USER_AUTH',
      ClientId: 'client-123',
      AuthParameters: {
        USERNAME: 'jess@example.com',
        PREFERRED_CHALLENGE: 'EMAIL_OTP',
        SECRET_HASH: SECRET_HASH,
      },
    });
    expect(result.statusCode).toBe(202);
    expect(result.headers).toEqual({ 'content-type': 'application/json' });
    expect(JSON.parse(result.body ?? '')).toEqual({ next: 'enter-code' });
    expect(result.cookies?.[0]).toMatch(
      /^fb_auth_flow=[^;]+; Secure; HttpOnly; SameSite=Strict; Path=\/api\/v1\/auth; Max-Age=180$/,
    );
    expect(
      openFlow(readCookie(result.cookies, 'fb_auth_flow') ?? '', SECRETS.flowKey, Date.now()),
    ).toEqual({ email: 'jess@example.com', session: 's4', kind: 'sign-in' });
  });

  it.each([
    [
      'TooManyFailedAttemptsException',
      new TooManyFailedAttemptsException({ message: 'x', $metadata: {} }),
    ],
    ['UserNotFoundException', new UserNotFoundException({ message: 'x', $metadata: {} })],
  ])('returns 400 expired on %s', async (_name, error) => {
    cognitoMock.on(RespondToAuthChallengeCommand).rejects(error);

    const result = await verify(buildRequest(SIGN_IN), SECRETS);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'expired' });
  });

  it('returns 400 expired when the flow cookie is older than 180s', async () => {
    const result = await verify(buildRequest(SIGN_IN, Date.now() - 181_000), SECRETS);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'expired' });
    expect(result.cookies).toEqual([CLEARED_FLOW_COOKIE]);
    expect(cognitoMock.calls()).toHaveLength(0);
  });

  it('returns 400 expired when the flow cookie is missing', async () => {
    const result = await verify({ body: '{"code":"123456"}', isBase64Encoded: false }, SECRETS);

    expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'expired' });
    expect(cognitoMock.calls()).toHaveLength(0);
  });

  it('rethrows MISSING_SESSION instead of mapping it to a reason', async () => {
    cognitoMock.on(ConfirmSignUpCommand).resolves({});
    cognitoMock.on(InitiateAuthCommand).resolves({});

    await expect(verify(buildRequest(SIGN_UP), SECRETS)).rejects.toThrow('MISSING_SESSION');
  });

  it('rethrows MISSING_TOKENS instead of mapping it to a reason', async () => {
    cognitoMock.on(RespondToAuthChallengeCommand).resolves({});

    await expect(verify(buildRequest(SIGN_IN), SECRETS)).rejects.toThrow('MISSING_TOKENS');
  });
});
