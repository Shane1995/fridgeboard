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
import { mockClient } from 'aws-sdk-client-mock';
import { openFlow } from '../../utils/flowToken/openFlow/index.ts';
import { sealFlow } from '../../utils/flowToken/sealFlow/index.ts';
import { readCookie } from '../../utils/cookies/readCookie/index.ts';
import { DEFAULT_LAMBDA_CONFIGURATION } from '../../../../configuration/lambdaConfigurationSchema/constants.ts';
import { getConfiguration } from '../../../../configuration/index.ts';
import { start } from './index.ts';
import { AuthFlowKind } from '../../utils/flowToken/constants.ts';

vi.mock('../../../../configuration/index.ts', () => ({ getConfiguration: vi.fn() }));

const cognitoMock = mockClient(CognitoIdentityProviderClient);
const sesMock = mockClient(SESv2Client);

const SECRETS = {
  userPoolId: 'pool-1',
  clientId: 'client-123',
  clientSecret: 'secret-abc',
  flowKey: 'flow-key',
};
const SECRET_HASH = 'n0vvPRSy+pkUqGp/4Nml7yskNIP+ZFAOLepv183K42g=';
const FLOW_COOKIE_PATTERN =
  /^fb_auth_flow=[^;]+; Secure; HttpOnly; SameSite=Strict; Path=\/api\/v1\/auth; Max-Age=180$/;

const request = { body: JSON.stringify({ email: ' Jess@Example.com ' }), isBase64Encoded: false };

const flowFrom = (cookies: string[] | undefined) =>
  openFlow(readCookie(cookies, 'fb_auth_flow') ?? '', SECRETS.flowKey, Date.now());

describe('start route', () => {
  beforeEach(() => {
    cognitoMock.reset();
    sesMock.reset();
    vi.mocked(getConfiguration).mockResolvedValue(DEFAULT_LAMBDA_CONFIGURATION);
    sesMock.on(GetEmailIdentityCommand).resolves({ VerifiedForSendingStatus: true });
  });

  it('signs up a new invited email and sets the flow cookie', async () => {
    cognitoMock
      .on(AdminGetUserCommand)
      .rejects(new UserNotFoundException({ message: 'not found', $metadata: {} }));
    cognitoMock
      .on(SignUpCommand)
      .resolves({ UserConfirmed: false, UserSub: 'sub-1', Session: 's1' });

    const result = await start(request, SECRETS);

    expect(result.statusCode).toBe(204);
    expect(sesMock.commandCalls(GetEmailIdentityCommand)[0]?.args[0].input).toEqual({
      EmailIdentity: 'jess@example.com',
    });
    expect(cognitoMock.commandCalls(SignUpCommand)[0]?.args[0].input).toEqual({
      ClientId: 'client-123',
      SecretHash: SECRET_HASH,
      Username: 'jess@example.com',
      UserAttributes: [{ Name: 'email', Value: 'jess@example.com' }],
    });
    expect(result.cookies?.[0]).toMatch(FLOW_COOKIE_PATTERN);
    expect(flowFrom(result.cookies)).toEqual({
      email: 'jess@example.com',
      session: 's1',
      kind: AuthFlowKind.SignUp,
    });
  });

  it('returns 403 no-invite when the pre-sign-up trigger rejects', async () => {
    cognitoMock
      .on(AdminGetUserCommand)
      .rejects(new UserNotFoundException({ message: 'not found', $metadata: {} }));
    cognitoMock.on(SignUpCommand).rejects(
      new UserLambdaValidationException({
        message: 'PreSignUp failed with error NO_INVITE.',
        $metadata: {},
      }),
    );

    const result = await start(request, SECRETS);

    expect(result.statusCode).toBe(403);
    expect(result.headers).toEqual({
      'content-type': 'application/json',
      'cache-control': 'no-store',
    });
    expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'no-invite' });
    expect(result.cookies).toEqual([]);
  });

  it('rethrows other pre-sign-up trigger failures', async () => {
    cognitoMock
      .on(AdminGetUserCommand)
      .rejects(new UserNotFoundException({ message: 'not found', $metadata: {} }));
    cognitoMock
      .on(SignUpCommand)
      .rejects(new UserLambdaValidationException({ message: 'boom', $metadata: {} }));

    await expect(start(request, SECRETS)).rejects.toThrow('boom');
  });

  it('returns 409 verify-email when SES has not verified the address', async () => {
    sesMock.on(GetEmailIdentityCommand).resolves({ VerifiedForSendingStatus: false });

    const result = await start(request, SECRETS);

    expect(result.statusCode).toBe(409);
    expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'verify-email' });
    expect(cognitoMock.calls()).toHaveLength(0);
  });

  it('returns 409 verify-email when SES has no identity for the address', async () => {
    sesMock
      .on(GetEmailIdentityCommand)
      .rejects(new NotFoundException({ message: 'missing', $metadata: {} }));

    const result = await start(request, SECRETS);

    expect(result.statusCode).toBe(409);
    expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'verify-email' });
    expect(cognitoMock.calls()).toHaveLength(0);
  });

  it('resends the confirmation code for an unconfirmed user', async () => {
    cognitoMock.on(AdminGetUserCommand).resolves({ Username: 'u', UserStatus: 'UNCONFIRMED' });
    cognitoMock.on(ResendConfirmationCodeCommand).resolves({});

    const result = await start(request, SECRETS);

    expect(result.statusCode).toBe(204);
    expect(cognitoMock.commandCalls(ResendConfirmationCodeCommand)[0]?.args[0].input).toEqual({
      ClientId: 'client-123',
      SecretHash: SECRET_HASH,
      Username: 'jess@example.com',
    });
    expect(cognitoMock.commandCalls(SignUpCommand)).toHaveLength(0);
    expect(flowFrom(result.cookies)).toEqual({
      email: 'jess@example.com',
      session: '',
      kind: AuthFlowKind.SignUp,
    });
  });

  it('carries a sign-up session from a matching flow cookie into the resend flow', async () => {
    cognitoMock.on(AdminGetUserCommand).resolves({ Username: 'u', UserStatus: 'UNCONFIRMED' });
    cognitoMock.on(ResendConfirmationCodeCommand).resolves({});
    const previous = sealFlow(
      { email: 'jess@example.com', session: 's1', kind: AuthFlowKind.SignUp },
      SECRETS.flowKey,
      Date.now(),
      180_000,
    );

    const result = await start({ ...request, cookies: [`fb_auth_flow=${previous}`] }, SECRETS);

    expect(cognitoMock.commandCalls(ResendConfirmationCodeCommand)).toHaveLength(1);
    expect(flowFrom(result.cookies)).toEqual({
      email: 'jess@example.com',
      session: 's1',
      kind: AuthFlowKind.SignUp,
    });
  });

  it('does not carry a session from a flow cookie for another email', async () => {
    cognitoMock.on(AdminGetUserCommand).resolves({ Username: 'u', UserStatus: 'UNCONFIRMED' });
    cognitoMock.on(ResendConfirmationCodeCommand).resolves({});
    const previous = sealFlow(
      { email: 'eve@example.com', session: 's1', kind: AuthFlowKind.SignUp },
      SECRETS.flowKey,
      Date.now(),
      180_000,
    );

    const result = await start({ ...request, cookies: [`fb_auth_flow=${previous}`] }, SECRETS);

    expect(flowFrom(result.cookies)?.session).toBe('');
  });

  it('begins EMAIL_OTP sign-in for a confirmed user', async () => {
    cognitoMock.on(AdminGetUserCommand).resolves({ Username: 'u', UserStatus: 'CONFIRMED' });
    cognitoMock.on(InitiateAuthCommand).resolves({ ChallengeName: 'EMAIL_OTP', Session: 's2' });

    const result = await start(request, SECRETS);

    expect(result.statusCode).toBe(204);
    expect(cognitoMock.commandCalls(AdminGetUserCommand)[0]?.args[0].input).toEqual({
      UserPoolId: 'pool-1',
      Username: 'jess@example.com',
    });
    expect(cognitoMock.commandCalls(InitiateAuthCommand)[0]?.args[0].input).toEqual({
      AuthFlow: 'USER_AUTH',
      ClientId: 'client-123',
      AuthParameters: {
        USERNAME: 'jess@example.com',
        PREFERRED_CHALLENGE: 'EMAIL_OTP',
        SECRET_HASH: SECRET_HASH,
      },
    });
    expect(result.cookies?.[0]).toMatch(FLOW_COOKIE_PATTERN);
    expect(flowFrom(result.cookies)).toEqual({
      email: 'jess@example.com',
      session: 's2',
      kind: AuthFlowKind.SignIn,
    });
  });

  it('returns 400 with no AWS call when the email is missing', async () => {
    const result = await start({ body: '{}', isBase64Encoded: false }, SECRETS);

    expect(result.statusCode).toBe(400);
    expect(sesMock.calls()).toHaveLength(0);
    expect(cognitoMock.calls()).toHaveLength(0);
  });

  it('returns 400 with no AWS call when the email has no @', async () => {
    const result = await start(
      { body: JSON.stringify({ email: 'jess.example.com' }), isBase64Encoded: false },
      SECRETS,
    );

    expect(result.statusCode).toBe(400);
    expect(sesMock.calls()).toHaveLength(0);
    expect(cognitoMock.calls()).toHaveLength(0);
  });

  it('sets the flow cookie lifetime from the configured ttl', async () => {
    vi.mocked(getConfiguration).mockResolvedValue({
      ...DEFAULT_LAMBDA_CONFIGURATION,
      settings: { ...DEFAULT_LAMBDA_CONFIGURATION.settings, flowTtlMs: 90_000 },
    });
    cognitoMock.on(AdminGetUserCommand).resolves({ Username: 'u', UserStatus: 'CONFIRMED' });
    cognitoMock.on(InitiateAuthCommand).resolves({ ChallengeName: 'EMAIL_OTP', Session: 's2' });

    const result = await start(request, SECRETS);

    expect(result.cookies?.[0]).toMatch(/Max-Age=90$/);
    expect(flowFrom(result.cookies)).toBeDefined();
  });
});
