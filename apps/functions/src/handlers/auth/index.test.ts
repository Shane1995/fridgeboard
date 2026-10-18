import {
  CognitoIdentityProviderClient,
  RevokeTokenCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { SESv2Client } from '@aws-sdk/client-sesv2';
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { mockClient } from 'aws-sdk-client-mock';
import { handler } from './index.ts';

const cognitoMock = mockClient(CognitoIdentityProviderClient);
const sesMock = mockClient(SESv2Client);
const ssmMock = mockClient(SSMClient);

const ORIGIN = 'https://app.fridgeboard.uk';
const ORIGIN_SECRET = 'origin-secret';

const buildEvent = (
  routeKey: string,
  headers: Record<string, string> = {
    origin: ORIGIN,
    'content-type': 'application/json',
    'x-api-origin-verify': ORIGIN_SECRET,
  },
): APIGatewayProxyEventV2 => ({
  version: '2.0',
  routeKey,
  rawPath: routeKey.split(' ')[1] ?? '',
  rawQueryString: '',
  headers,
  cookies: ['fb_rt=secret-refresh-token'],
  body: JSON.stringify({ email: 'jess@example.com' }),
  isBase64Encoded: false,
  requestContext: {
    accountId: '123',
    apiId: 'api',
    domainName: 'app.fridgeboard.uk',
    domainPrefix: 'app',
    http: {
      method: 'POST',
      path: routeKey.split(' ')[1] ?? '',
      protocol: 'HTTP/1.1',
      sourceIp: '127.0.0.1',
      userAgent: 'test',
    },
    requestId: 'req-1',
    routeKey,
    stage: '$default',
    time: '',
    timeEpoch: 0,
  },
});

describe('auth handler', () => {
  beforeEach(() => {
    cognitoMock.reset();
    sesMock.reset();
    ssmMock.reset();
    vi.stubEnv('APP_ORIGIN', ORIGIN);
    vi.stubEnv('API_ORIGIN_SECRET', ORIGIN_SECRET);
    vi.stubEnv('SECRETS_PARAM', '/fridgeboard/auth/secrets');
    ssmMock.on(GetParameterCommand).resolves({
      Parameter: {
        Value: JSON.stringify({
          userPoolId: 'pool-1',
          clientId: 'client-123',
          clientSecret: 'secret-abc',
          flowKey: 'flow-key',
        }),
      },
    });
  });

  it('returns 403 forbidden when the origin secret header is missing', async () => {
    const result = await handler(
      buildEvent('POST /api/v1/auth/start', { origin: ORIGIN, 'content-type': 'application/json' }),
    );

    expect(result.statusCode).toBe(403);
    expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'forbidden' });
    expect(ssmMock.commandCalls(GetParameterCommand)).toHaveLength(0);
  });

  it('start returns 403 forbidden for a wrong Origin', async () => {
    const result = await handler(
      buildEvent('POST /api/v1/auth/start', {
        origin: 'https://evil.example',
        'content-type': 'application/json',
      }),
    );

    expect(result.statusCode).toBe(403);
    expect(result.headers).toEqual({
      'content-type': 'application/json',
      'cache-control': 'no-store',
    });
    expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'forbidden' });
    expect(sesMock.calls()).toHaveLength(0);
    expect(cognitoMock.calls()).toHaveLength(0);
  });

  it('returns 403 forbidden for a form post content type', async () => {
    const result = await handler(
      buildEvent('POST /api/v1/auth/refresh', {
        origin: ORIGIN,
        'content-type': 'application/x-www-form-urlencoded',
      }),
    );

    expect(result.statusCode).toBe(403);
    expect(cognitoMock.calls()).toHaveLength(0);
  });

  it('dispatches to the route for the route key', async () => {
    cognitoMock.on(RevokeTokenCommand).resolves({});

    const result = await handler(buildEvent('POST /api/v1/auth/sign-out'));

    expect(result.statusCode).toBe(204);
    expect(cognitoMock.commandCalls(RevokeTokenCommand)).toHaveLength(1);
  });

  it('returns 404 for an unknown route key', async () => {
    const result = await handler(buildEvent('POST /api/v1/auth/unknown'));

    expect(result.statusCode).toBe(404);
  });

  it('returns 500 and logs only the error name when a route fails', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    cognitoMock.on(RevokeTokenCommand).rejects(
      Object.assign(new Error('token secret-refresh-token jess@example.com'), {
        name: 'InternalErrorException',
      }),
    );

    const result = await handler(buildEvent('POST /api/v1/auth/sign-out'));

    expect(result.statusCode).toBe(500);
    expect(result.body).toBeUndefined();
    expect(log.mock.calls).toEqual([['auth route failed', 'InternalErrorException']]);
    log.mockRestore();
  });
});
