import type { APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda';
import { withAuthenticatedUser } from './index.ts';

const buildEvent = (
  claims: Record<string, string>,
  headers: Record<string, string> = { 'x-api-origin-verify': 'origin-secret' },
): APIGatewayProxyEventV2WithJWTAuthorizer => ({
  version: '2.0',
  routeKey: 'GET /x',
  rawPath: '/x',
  rawQueryString: '',
  headers,
  isBase64Encoded: false,
  requestContext: {
    accountId: '1',
    apiId: 'a',
    domainName: 'd',
    domainPrefix: 'd',
    http: { method: 'GET', path: '/x', protocol: 'HTTP/1.1', sourceIp: '1', userAgent: 't' },
    requestId: 'r',
    routeKey: 'GET /x',
    stage: '$default',
    time: '',
    timeEpoch: 0,
    authorizer: { principalId: 'p', integrationLatency: 0, jwt: { claims, scopes: [] } },
  },
});

describe('withAuthenticatedUser', () => {
  const inner = vi.fn(async () => ({ statusCode: 200 }));
  const handler = withAuthenticatedUser(inner);

  beforeEach(() => {
    inner.mockClear();
    vi.stubEnv('API_ORIGIN_SECRET', 'origin-secret');
  });

  it('refuses a request that did not come through the origin', async () => {
    const result = await handler(buildEvent({ sub: 's' }, {}));

    expect(result.statusCode).toBe(403);
    expect(inner).not.toHaveBeenCalled();
  });

  it.each([{}, { sub: '' }])('returns 401 when the sub claim is %j', async (claims) => {
    expect(await handler(buildEvent(claims))).toEqual({ statusCode: 401 });
    expect(inner).not.toHaveBeenCalled();
  });

  it('hands the event, claims and sub to the handler', async () => {
    const event = buildEvent({ sub: 'sub-1', email: 'a@x.com' });

    const result = await handler(event);

    expect(result).toEqual({ statusCode: 200 });
    expect(inner).toHaveBeenCalledWith({
      event,
      claims: { sub: 'sub-1', email: 'a@x.com' },
      sub: 'sub-1',
    });
  });
});
