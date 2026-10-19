import {
  CognitoIdentityProviderClient,
  ExpiredCodeException,
  NotAuthorizedException,
  RespondToAuthChallengeCommand,
  TooManyFailedAttemptsException,
} from '@aws-sdk/client-cognito-identity-provider';
import { mockClient } from 'aws-sdk-client-mock';
import { sealFlow } from '../../utils/flowToken/sealFlow/index.ts';
import type { AuthFlow } from '../../utils/flowToken/types.ts';
import { passkeyVerify } from './index.ts';

const cognitoMock = mockClient(CognitoIdentityProviderClient);

const SECRETS = {
  userPoolId: 'pool-1',
  clientId: 'client-123',
  clientSecret: 'secret-abc',
  flowKey: 'flow-key',
};
const SECRET_HASH = 'n0vvPRSy+pkUqGp/4Nml7yskNIP+ZFAOLepv183K42g=';
const PASSKEY: AuthFlow = { email: 'jess@example.com', session: 's1', kind: 'passkey' };
const TOKENS = { AccessToken: 'access-1', ExpiresIn: 900, RefreshToken: 'refresh-1' };
const CREDENTIAL = { id: 'cred-1', type: 'public-key', response: { signature: 'sig' } };
const CLEARED_FLOW_COOKIE =
  'fb_auth_flow=; Secure; HttpOnly; SameSite=Strict; Path=/api/v1/auth; Max-Age=0';

const buildRequest = (flow: AuthFlow | undefined, body: unknown = { credential: CREDENTIAL }) => ({
  body: JSON.stringify(body),
  isBase64Encoded: false,
  cookies: flow ? [`fb_auth_flow=${sealFlow(flow, SECRETS.flowKey, Date.now(), 180_000)}`] : [],
});

describe('passkeyVerify route', () => {
  beforeEach(() => cognitoMock.reset());

  it.each([
    ['no flow cookie', undefined],
    ['an email-code sign-in flow', { ...PASSKEY, kind: 'sign-in' as const }],
    ['a sign-up flow', { ...PASSKEY, kind: 'sign-up' as const }],
  ])('rejects %s as expired and never calls Cognito', async (_label, flow) => {
    const result = await passkeyVerify(buildRequest(flow), SECRETS);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'expired' });
    expect(result.cookies).toContain(CLEARED_FLOW_COOKIE);
    expect(cognitoMock.calls()).toHaveLength(0);
  });

  it.each([{}, { credential: 'x' }, { credential: null }])(
    'rejects a missing credential %j',
    async (body) => {
      const result = await passkeyVerify(buildRequest(PASSKEY, body), SECRETS);

      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'passkey-failed' });
      expect(cognitoMock.calls()).toHaveLength(0);
    },
  );

  it('answers the WEB_AUTHN challenge with the credential and signs the user in', async () => {
    cognitoMock.on(RespondToAuthChallengeCommand).resolves({ AuthenticationResult: TOKENS });

    const result = await passkeyVerify(buildRequest(PASSKEY), SECRETS);

    expect(cognitoMock.commandCalls(RespondToAuthChallengeCommand)[0]?.args[0].input).toEqual({
      ClientId: 'client-123',
      ChallengeName: 'WEB_AUTHN',
      Session: 's1',
      ChallengeResponses: {
        USERNAME: 'jess@example.com',
        CREDENTIAL: JSON.stringify(CREDENTIAL),
        SECRET_HASH,
      },
    });
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body ?? '')).toEqual({ accessToken: 'access-1', expiresIn: 900 });
    expect(result.cookies).toContain(
      'fb_rt=refresh-1; Secure; HttpOnly; SameSite=Strict; Path=/api/v1/auth; Max-Age=315360000',
    );
    expect(result.cookies).toContain(CLEARED_FLOW_COOKIE);
  });

  it.each([
    ['a refused assertion', new NotAuthorizedException({ message: 'x', $metadata: {} })],
    ['an expired challenge', new ExpiredCodeException({ message: 'x', $metadata: {} })],
    ['too many attempts', new TooManyFailedAttemptsException({ message: 'x', $metadata: {} })],
  ])('maps %s to passkey-failed and clears the flow', async (_label, error) => {
    cognitoMock.on(RespondToAuthChallengeCommand).rejects(error);

    const result = await passkeyVerify(buildRequest(PASSKEY), SECRETS);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'passkey-failed' });
    expect(result.cookies).toContain(CLEARED_FLOW_COOKIE);
  });

  it('rethrows unexpected Cognito errors', async () => {
    cognitoMock.on(RespondToAuthChallengeCommand).rejects(new Error('boom'));

    await expect(passkeyVerify(buildRequest(PASSKEY), SECRETS)).rejects.toThrow('boom');
  });
});
