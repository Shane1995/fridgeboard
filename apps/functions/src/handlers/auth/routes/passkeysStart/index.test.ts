import {
  CognitoIdentityProviderClient,
  NotAuthorizedException,
  StartWebAuthnRegistrationCommand,
  WebAuthnNotEnabledException,
} from '@aws-sdk/client-cognito-identity-provider';
import { mockClient } from 'aws-sdk-client-mock';
import type { AuthorizedRequest } from '../../types.ts';
import { passkeysStart } from './index.ts';

const cognitoMock = mockClient(CognitoIdentityProviderClient);

const SECRETS = { userPoolId: 'pool-1', clientId: 'c', clientSecret: 's', flowKey: 'k' };
const OPTIONS = { challenge: 'abc', rp: { id: 'fridgeboard.uk' }, user: { id: 'u' } };

const buildRequest = (
  authTime: number | undefined,
  headers: Record<string, string> = { authorization: 'Bearer access-1' },
): AuthorizedRequest => ({
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
      path: '/api/v1/auth/passkeys/start',
      protocol: 'HTTP/1.1',
      sourceIp: '127.0.0.1',
      userAgent: 'test',
    },
    requestId: 'req-1',
    routeKey: 'POST /api/v1/auth/passkeys/start',
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

const nowSeconds = () => Math.floor(Date.now() / 1000);

describe('passkeysStart route', () => {
  beforeEach(() => cognitoMock.reset());

  it('requires a recent sign-in and never calls Cognito without one', async () => {
    const stale = await passkeysStart(buildRequest(nowSeconds() - 400), SECRETS);
    const missing = await passkeysStart(buildRequest(undefined), SECRETS);

    for (const result of [stale, missing]) {
      expect(result.statusCode).toBe(403);
      expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'recent-code-required' });
    }
    expect(cognitoMock.calls()).toHaveLength(0);
  });

  it.each([{}, { authorization: 'Basic abc' }])(
    'returns 401 without a bearer token %j',
    async (headers) => {
      const result = await passkeysStart(buildRequest(nowSeconds(), headers), SECRETS);

      expect(result.statusCode).toBe(401);
      expect(cognitoMock.calls()).toHaveLength(0);
    },
  );

  it('starts registration with the caller access token and returns the creation options', async () => {
    cognitoMock
      .on(StartWebAuthnRegistrationCommand)
      .resolves({ CredentialCreationOptions: OPTIONS });

    const result = await passkeysStart(buildRequest(nowSeconds() - 30), SECRETS);

    expect(cognitoMock.commandCalls(StartWebAuthnRegistrationCommand)[0]?.args[0].input).toEqual({
      AccessToken: 'access-1',
    });
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body ?? '')).toEqual({ options: OPTIONS });
  });

  it('returns 401 when Cognito refuses the access token', async () => {
    cognitoMock
      .on(StartWebAuthnRegistrationCommand)
      .rejects(new NotAuthorizedException({ message: 'x', $metadata: {} }));

    const result = await passkeysStart(buildRequest(nowSeconds()), SECRETS);

    expect(result.statusCode).toBe(401);
  });

  it('rethrows other Cognito errors', async () => {
    cognitoMock
      .on(StartWebAuthnRegistrationCommand)
      .rejects(new WebAuthnNotEnabledException({ message: 'x', $metadata: {} }));

    await expect(passkeysStart(buildRequest(nowSeconds()), SECRETS)).rejects.toThrow();
  });
});
