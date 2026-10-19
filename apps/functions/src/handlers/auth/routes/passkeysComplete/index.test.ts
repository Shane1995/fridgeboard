import {
  CognitoIdentityProviderClient,
  CompleteWebAuthnRegistrationCommand,
  GetUserCommand,
  NotAuthorizedException,
  WebAuthnChallengeNotFoundException,
  WebAuthnOriginNotAllowedException,
} from '@aws-sdk/client-cognito-identity-provider';
import { mockClient } from 'aws-sdk-client-mock';
import { sendPasskeyNotice } from '../../utils/sendPasskeyNotice/index.ts';
import type { AuthorizedRequest } from '../../types.ts';
import { passkeysComplete } from './index.ts';

vi.mock('../../utils/sendPasskeyNotice/index.ts', () => ({ sendPasskeyNotice: vi.fn() }));

const cognitoMock = mockClient(CognitoIdentityProviderClient);

const SECRETS = { userPoolId: 'pool-1', clientId: 'c', clientSecret: 's', flowKey: 'k' };
const CREDENTIAL = { id: 'cred-1', type: 'public-key', response: { attestationObject: 'x' } };

const nowSeconds = () => Math.floor(Date.now() / 1000);

const buildRequest = (
  authTime: number | undefined,
  body: unknown = { credential: CREDENTIAL },
  headers: Record<string, string> = { authorization: 'Bearer access-1' },
): AuthorizedRequest => ({
  body: JSON.stringify(body),
  cookies: [],
  isBase64Encoded: false,
  headers,
  requestContext: {
    accountId: '123',
    apiId: 'api',
    domainName: 'app.fridgeboard.uk',
    domainPrefix: 'app',
    http: {
      method: 'POST',
      path: '/api/v1/auth/passkeys/complete',
      protocol: 'HTTP/1.1',
      sourceIp: '127.0.0.1',
      userAgent: 'test',
    },
    requestId: 'req-1',
    routeKey: 'POST /api/v1/auth/passkeys/complete',
    stage: '$default',
    time: '',
    timeEpoch: 0,
    authorizer: {
      principalId: 'p',
      integrationLatency: 0,
      jwt: {
        claims: authTime === undefined ? { sub: 'sub-1' } : { sub: 'sub-1', auth_time: authTime },
        scopes: [],
      },
    },
  },
});

describe('passkeysComplete route', () => {
  beforeEach(() => {
    cognitoMock.reset();
    vi.mocked(sendPasskeyNotice).mockReset();
    cognitoMock.on(CompleteWebAuthnRegistrationCommand).resolves({});
    cognitoMock.on(GetUserCommand).resolves({
      Username: 'sub-1',
      UserAttributes: [{ Name: 'email', Value: 'jess@example.com' }],
    });
  });

  it('requires a recent sign-in and never calls Cognito without one', async () => {
    const result = await passkeysComplete(buildRequest(nowSeconds() - 400), SECRETS);

    expect(result.statusCode).toBe(403);
    expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'recent-code-required' });
    expect(cognitoMock.calls()).toHaveLength(0);
  });

  it('returns 401 without a bearer token', async () => {
    const result = await passkeysComplete(buildRequest(nowSeconds(), undefined, {}), SECRETS);

    expect(result.statusCode).toBe(401);
    expect(cognitoMock.calls()).toHaveLength(0);
  });

  it.each([{}, { credential: 'x' }, { credential: null }])(
    'rejects a missing credential %j',
    async (body) => {
      const result = await passkeysComplete(buildRequest(nowSeconds(), body), SECRETS);

      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'passkey-failed' });
      expect(cognitoMock.calls()).toHaveLength(0);
    },
  );

  it('completes registration with the caller token and emails a notice', async () => {
    const result = await passkeysComplete(buildRequest(nowSeconds() - 20), SECRETS);

    expect(cognitoMock.commandCalls(CompleteWebAuthnRegistrationCommand)[0]?.args[0].input).toEqual(
      {
        AccessToken: 'access-1',
        Credential: CREDENTIAL,
      },
    );
    expect(cognitoMock.commandCalls(GetUserCommand)[0]?.args[0].input).toEqual({
      AccessToken: 'access-1',
    });
    expect(sendPasskeyNotice).toHaveBeenCalledWith('jess@example.com');
    expect(result.statusCode).toBe(204);
  });

  it('still succeeds when the notice cannot be sent', async () => {
    vi.mocked(sendPasskeyNotice).mockRejectedValue(new Error('ses down'));

    const result = await passkeysComplete(buildRequest(nowSeconds()), SECRETS);

    expect(result.statusCode).toBe(204);
  });

  it('skips the notice when the account has no email attribute', async () => {
    cognitoMock.on(GetUserCommand).resolves({ Username: 'sub-1', UserAttributes: [] });

    const result = await passkeysComplete(buildRequest(nowSeconds()), SECRETS);

    expect(result.statusCode).toBe(204);
    expect(sendPasskeyNotice).not.toHaveBeenCalled();
  });

  it.each([
    [
      'a missing challenge',
      new WebAuthnChallengeNotFoundException({ message: 'x', $metadata: {} }),
    ],
    ['a disallowed origin', new WebAuthnOriginNotAllowedException({ message: 'x', $metadata: {} })],
  ])('maps %s to passkey-failed', async (_label, error) => {
    cognitoMock.on(CompleteWebAuthnRegistrationCommand).rejects(error);

    const result = await passkeysComplete(buildRequest(nowSeconds()), SECRETS);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'passkey-failed' });
    expect(sendPasskeyNotice).not.toHaveBeenCalled();
  });

  it('returns 401 when Cognito refuses the access token', async () => {
    cognitoMock
      .on(CompleteWebAuthnRegistrationCommand)
      .rejects(new NotAuthorizedException({ message: 'x', $metadata: {} }));

    const result = await passkeysComplete(buildRequest(nowSeconds()), SECRETS);

    expect(result.statusCode).toBe(401);
  });

  it('rethrows unexpected Cognito errors', async () => {
    cognitoMock.on(CompleteWebAuthnRegistrationCommand).rejects(new Error('boom'));

    await expect(passkeysComplete(buildRequest(nowSeconds()), SECRETS)).rejects.toThrow('boom');
  });
});
