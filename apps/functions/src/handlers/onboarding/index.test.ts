import {
  BatchGetCommand,
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import type { APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda';
import { mockClient } from 'aws-sdk-client-mock';
import { HouseholdRole } from '../../utils/isHouseholdRole/constants.ts';
import { OnboardingSectionId } from './constants.ts';
import { handler } from './index.ts';

const ddbMock = mockClient(DynamoDBDocumentClient);

const buildEvent = (
  claims: Record<string, string> = { sub: 'sub-1' },
): APIGatewayProxyEventV2WithJWTAuthorizer => ({
  version: '2.0',
  routeKey: 'GET /api/v1/me/onboarding',
  rawPath: '/api/v1/me/onboarding',
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
      path: '/api/v1/me/onboarding',
      protocol: 'HTTP/1.1',
      sourceIp: '127.0.0.1',
      userAgent: 'test',
    },
    requestId: 'req-1',
    routeKey: 'GET /api/v1/me/onboarding',
    stage: '$default',
    time: '',
    timeEpoch: 0,
    authorizer: { principalId: 'p', integrationLatency: 0, jwt: { claims, scopes: [] } },
  },
});

const sectionsOf = (body: string | undefined) => JSON.parse(body ?? '').sections;

describe('onboarding handler', () => {
  beforeEach(() => {
    ddbMock.reset();
    vi.stubEnv('TABLE_NAME', 'fridgeboard');
    vi.stubEnv('API_ORIGIN_SECRET', 'origin-secret');
    ddbMock
      .on(GetCommand)
      .resolves({ Item: { email: 'jess@example.com', canCreateHousehold: true } });
    ddbMock.on(QueryCommand).resolves({ Items: [] });
  });

  it('returns 403 when the origin secret header is missing', async () => {
    const result = await handler({ ...buildEvent(), headers: {} });

    expect(result.statusCode).toBe(403);
    expect(ddbMock.calls()).toHaveLength(0);
  });

  it('returns 401 when the sub claim is missing', async () => {
    expect(await handler(buildEvent({}))).toEqual({ statusCode: 401 });
  });

  it('returns 404 when the profile is missing', async () => {
    ddbMock.on(GetCommand).resolves({});

    expect(await handler(buildEvent())).toEqual({ statusCode: 404 });
  });

  it('asks a creator without a username or household for both', async () => {
    const result = await handler(buildEvent());

    expect(result.statusCode).toBe(200);
    expect(sectionsOf(result.body)).toEqual([
      { id: OnboardingSectionId.Username, done: false },
      { id: OnboardingSectionId.Household, done: false },
    ]);
  });

  it('marks the household section done once the user belongs to one', async () => {
    ddbMock
      .on(GetCommand)
      .resolves({ Item: { email: 'a@x.com', username: 'jess', canCreateHousehold: true } });
    ddbMock.on(QueryCommand).resolves({
      Items: [{ GSI1SK: 'HH#h1', role: HouseholdRole.Owner }],
    });
    ddbMock.on(BatchGetCommand).resolves({
      Responses: { fridgeboard: [{ PK: 'HH#h1', SK: 'META', name: 'Home' }] },
    });

    const result = await handler(buildEvent());

    expect(sectionsOf(result.body)).toEqual([
      { id: OnboardingSectionId.Username, done: true },
      { id: OnboardingSectionId.Household, done: true },
    ]);
  });

  it('offers admins the household section', async () => {
    ddbMock.on(GetCommand).resolves({ Item: { email: 'a@x.com', canCreateHousehold: false } });

    const result = await handler(buildEvent({ sub: 'sub-1', 'cognito:groups': '[admin]' }));

    expect(sectionsOf(result.body)).toContainEqual({
      id: OnboardingSectionId.Household,
      done: false,
    });
  });

  it('tells an uninvited user with no household to ask for an invite', async () => {
    ddbMock.on(GetCommand).resolves({ Item: { email: 'a@x.com', canCreateHousehold: false } });

    const result = await handler(buildEvent());

    expect(sectionsOf(result.body)).toContainEqual({
      id: OnboardingSectionId.NeedsInvite,
      done: false,
    });
  });
});
