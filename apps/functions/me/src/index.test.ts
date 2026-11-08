import { DynamoDBDocumentClient, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import type { APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda';
import { mockClient } from 'aws-sdk-client-mock';
import { handler } from './index.ts';

const ddbMock = mockClient(DynamoDBDocumentClient);

const buildEvent = (
  claims: Record<string, string | number | boolean | string[]> = { sub: 'sub-1' },
): APIGatewayProxyEventV2WithJWTAuthorizer => ({
  version: '2.0',
  routeKey: 'GET /api/v1/me',
  rawPath: '/api/v1/me',
  rawQueryString: '',
  headers: { 'x-api-origin-verify': 'origin-secret' },
  isBase64Encoded: false,
  requestContext: {
    accountId: '123',
    apiId: 'api',
    domainName: 'app.fridgeboard.uk',
    domainPrefix: 'app',
    http: {
      method: 'GET',
      path: '/api/v1/me',
      protocol: 'HTTP/1.1',
      sourceIp: '127.0.0.1',
      userAgent: 'test',
    },
    requestId: 'req-1',
    routeKey: 'GET /api/v1/me',
    stage: '$default',
    time: '',
    timeEpoch: 0,
    authorizer: { principalId: 'p', integrationLatency: 0, jwt: { claims, scopes: [] } },
  },
});

const profile = { email: 'jess@example.com', canCreateHousehold: true };

describe('me handler', () => {
  beforeEach(() => {
    ddbMock.reset();
    vi.stubEnv('TABLE_NAME', 'fridgeboard');
    vi.stubEnv('API_ORIGIN_SECRET', 'origin-secret');
    ddbMock.on(GetCommand).resolves({ Item: profile });
    ddbMock.on(QueryCommand).resolves({ Items: [] });
  });

  it('returns 403 when the origin secret header is missing', async () => {
    const result = await handler({ ...buildEvent(), headers: {} });

    expect(result.statusCode).toBe(403);
    expect(ddbMock.commandCalls(GetCommand)).toHaveLength(0);
  });

  it('returns the profile identity', async () => {
    const result = await handler(buildEvent());

    expect(result).toMatchObject({
      statusCode: 200,
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    });
    expect(JSON.parse(result.body ?? '')).toEqual({
      sub: 'sub-1',
      email: 'jess@example.com',
      username: null,
      isAdmin: false,
      canCreateHousehold: true,
      hasOnboarding: true,
    });
    expect(ddbMock.commandCalls(GetCommand)[0]?.args[0].input).toMatchObject({
      TableName: 'fridgeboard',
      Key: { PK: 'USER#sub-1', SK: 'PROFILE' },
    });
  });

  it('has no onboarding left once the user has a username and a household', async () => {
    ddbMock.on(GetCommand).resolves({ Item: { ...profile, username: 'jess' } });
    ddbMock.on(QueryCommand).resolves({ Items: [{ GSI1SK: 'HH#h1', role: 'owner' }] });

    const result = await handler(buildEvent());

    expect(JSON.parse(result.body ?? '').hasOnboarding).toBe(false);
  });

  it('marks admins from cognito:groups', async () => {
    const result = await handler(buildEvent({ sub: 'sub-1', 'cognito:groups': '[admin]' }));

    expect(JSON.parse(result.body ?? '').isAdmin).toBe(true);
  });

  it.each([
    ['bare string', 'admin', true],
    ['among others', '[staff admin]', true],
    ['similar name', '[administrators]', false],
    ['suffixed name', '[admin2]', false],
    ['prefixed name', '[notadmin]', false],
    ['other group', '[staff]', false],
    ['missing', undefined, false],
  ])('reads cognito:groups as %s', async (_name, groups, expected) => {
    const claims =
      groups === undefined ? { sub: 'sub-1' } : { sub: 'sub-1', 'cognito:groups': groups };

    const result = await handler(buildEvent(claims));

    expect(JSON.parse(result.body ?? '').isAdmin).toBe(expected);
  });

  it('returns 404 with no body when the profile is missing', async () => {
    ddbMock.on(GetCommand).resolves({});

    const result = await handler(buildEvent());

    expect(result).toEqual({ statusCode: 404 });
  });

  it('returns 401 when the sub claim is missing', async () => {
    const result = await handler(buildEvent({}));

    expect(result).toEqual({ statusCode: 401 });
    expect(ddbMock.calls()).toHaveLength(0);
  });
});
