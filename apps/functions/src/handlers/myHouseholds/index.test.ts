import { BatchGetCommand, DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import type { APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda';
import { mockClient } from 'aws-sdk-client-mock';
import { HouseholdRole } from '../../utils/isHouseholdRole/constants.ts';
import { handler } from './index.ts';

const ddbMock = mockClient(DynamoDBDocumentClient);

const buildEvent = (
  claims: Record<string, string> = { sub: 'sub-1' },
): APIGatewayProxyEventV2WithJWTAuthorizer => ({
  version: '2.0',
  routeKey: 'GET /api/v1/households',
  rawPath: '/api/v1/households',
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
      path: '/api/v1/households',
      protocol: 'HTTP/1.1',
      sourceIp: '127.0.0.1',
      userAgent: 'test',
    },
    requestId: 'req-1',
    routeKey: 'GET /api/v1/households',
    stage: '$default',
    time: '',
    timeEpoch: 0,
    authorizer: { principalId: 'p', integrationLatency: 0, jwt: { claims, scopes: [] } },
  },
});

describe('myHouseholds handler', () => {
  beforeEach(() => {
    ddbMock.reset();
    vi.stubEnv('TABLE_NAME', 'fridgeboard');
    vi.stubEnv('API_ORIGIN_SECRET', 'origin-secret');
  });

  it('returns 403 when the origin secret header is missing', async () => {
    const result = await handler({ ...buildEvent(), headers: {} });

    expect(result.statusCode).toBe(403);
    expect(ddbMock.calls()).toHaveLength(0);
  });

  it('returns 401 when the sub claim is missing', async () => {
    const result = await handler(buildEvent({}));

    expect(result).toEqual({ statusCode: 401 });
    expect(ddbMock.calls()).toHaveLength(0);
  });

  it('returns the households of the signed-in user', async () => {
    ddbMock.on(QueryCommand).resolves({
      Items: [{ GSI1SK: 'HH#h1', role: HouseholdRole.Owner }],
    });
    ddbMock.on(BatchGetCommand).resolves({
      Responses: { fridgeboard: [{ PK: 'HH#h1', SK: 'META', name: 'Home' }] },
    });

    const result = await handler(buildEvent());

    expect(result).toMatchObject({
      statusCode: 200,
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    });
    expect(JSON.parse(result.body ?? '')).toEqual({
      households: [{ id: 'h1', name: 'Home', role: HouseholdRole.Owner }],
    });
    expect(ddbMock.commandCalls(QueryCommand)[0]?.args[0].input).toMatchObject({
      ExpressionAttributeValues: { ':pk': 'USER#sub-1' },
    });
  });
});
