import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  type InitiateAuthCommandOutput,
  NotAuthorizedException,
  UserNotFoundException,
} from '@aws-sdk/client-cognito-identity-provider';
import { DEFAULT_LAMBDA_CONFIGURATION } from '@fridgeboard/contract/configuration/lambda/constants';
import { mockClient } from 'aws-sdk-client-mock';
import { getConfiguration } from '../../../../configuration/index.ts';
import { readCookie } from '../../utils/cookies/readCookie/index.ts';
import { openFlow } from '../../utils/flowToken/openFlow/index.ts';
import { passkeyStart } from './index.ts';

vi.mock('../../../../configuration/index.ts', () => ({ getConfiguration: vi.fn() }));

const cognitoMock = mockClient(CognitoIdentityProviderClient);

const SECRETS = {
  userPoolId: 'pool-1',
  clientId: 'client-123',
  clientSecret: 'secret-abc',
  flowKey: 'flow-key',
};
const SECRET_HASH = 'n0vvPRSy+pkUqGp/4Nml7yskNIP+ZFAOLepv183K42g=';
const OPTIONS = { challenge: 'abc', rpId: 'fridgeboard.uk', userVerification: 'required' };

const request = (email: unknown) => ({
  body: JSON.stringify({ email }),
  isBase64Encoded: false,
  cookies: [],
});

const expectEmailCode = (result: Awaited<ReturnType<typeof passkeyStart>>) => {
  expect(result.statusCode).toBe(200);
  expect(JSON.parse(result.body ?? '')).toEqual({ next: 'email-code' });
};

describe('passkeyStart route', () => {
  beforeEach(() => {
    cognitoMock.reset();
    vi.mocked(getConfiguration).mockResolvedValue(DEFAULT_LAMBDA_CONFIGURATION);
  });

  it('returns 400 for a missing or malformed email without calling Cognito', async () => {
    expect((await passkeyStart(request(''), SECRETS)).statusCode).toBe(400);
    expect((await passkeyStart(request('nope'), SECRETS)).statusCode).toBe(400);
    expect(cognitoMock.calls()).toHaveLength(0);
  });

  it('asks Cognito for a WEB_AUTHN challenge for the normalised email', async () => {
    cognitoMock.on(InitiateAuthCommand).resolves({
      ChallengeName: 'WEB_AUTHN',
      Session: 'session-1',
      ChallengeParameters: { CREDENTIAL_REQUEST_OPTIONS: JSON.stringify(OPTIONS) },
    });

    await passkeyStart(request(' Jess@Example.com '), SECRETS);

    expect(cognitoMock.commandCalls(InitiateAuthCommand)[0]?.args[0].input).toEqual({
      AuthFlow: 'USER_AUTH',
      ClientId: 'client-123',
      AuthParameters: {
        USERNAME: 'jess@example.com',
        PREFERRED_CHALLENGE: 'WEB_AUTHN',
        SECRET_HASH,
      },
    });
  });

  it('returns the request options and seals a passkey flow cookie', async () => {
    cognitoMock.on(InitiateAuthCommand).resolves({
      ChallengeName: 'WEB_AUTHN',
      Session: 'session-1',
      ChallengeParameters: { CREDENTIAL_REQUEST_OPTIONS: JSON.stringify(OPTIONS) },
    });

    const result = await passkeyStart(request('jess@example.com'), SECRETS);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body ?? '')).toEqual({ options: OPTIONS });
    const flow = openFlow(readCookie(result.cookies, 'fb_auth_flow') ?? '', 'flow-key', Date.now());
    expect(flow).toEqual({ email: 'jess@example.com', session: 'session-1', kind: 'passkey' });
  });

  const FALLBACKS: [string, InitiateAuthCommandOutput][] = [
    [
      'no passkey registered (SELECT_CHALLENGE)',
      { $metadata: {}, ChallengeName: 'SELECT_CHALLENGE', Session: 's' },
    ],
    [
      'no session',
      {
        $metadata: {},
        ChallengeName: 'WEB_AUTHN',
        ChallengeParameters: { CREDENTIAL_REQUEST_OPTIONS: '{}' },
      },
    ],
    [
      'no options',
      { $metadata: {}, ChallengeName: 'WEB_AUTHN', Session: 's', ChallengeParameters: {} },
    ],
    [
      'unreadable options',
      {
        $metadata: {},
        ChallengeName: 'WEB_AUTHN',
        Session: 's',
        ChallengeParameters: { CREDENTIAL_REQUEST_OPTIONS: 'nope' },
      },
    ],
  ];

  it.each(FALLBACKS)('falls back to the email code for %s', async (_label, response) => {
    cognitoMock.on(InitiateAuthCommand).resolves(response);

    const result = await passkeyStart(request('jess@example.com'), SECRETS);

    expectEmailCode(result);
    expect(result.cookies ?? []).toHaveLength(0);
  });

  it.each([
    ['an unknown user', new UserNotFoundException({ message: 'x', $metadata: {} })],
    ['a refused sign-in', new NotAuthorizedException({ message: 'x', $metadata: {} })],
  ])('answers %s exactly like a user without a passkey', async (_label, error) => {
    cognitoMock.on(InitiateAuthCommand).rejects(error);

    const result = await passkeyStart(request('jess@example.com'), SECRETS);

    expectEmailCode(result);
  });

  it('rethrows unexpected Cognito errors', async () => {
    cognitoMock.on(InitiateAuthCommand).rejects(new Error('boom'));

    await expect(passkeyStart(request('jess@example.com'), SECRETS)).rejects.toThrow('boom');
  });
});
