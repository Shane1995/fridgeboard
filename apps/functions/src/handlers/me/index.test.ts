import {
  BatchGetCommand,
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
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

  it('returns the profile with an empty households list', async () => {
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
      households: [],
    });
    expect(ddbMock.commandCalls(BatchGetCommand)).toHaveLength(0);
    expect(ddbMock.commandCalls(GetCommand)[0]?.args[0].input).toMatchObject({
      TableName: 'fridgeboard',
      Key: { PK: 'USER#sub-1', SK: 'PROFILE' },
    });
  });

  it('returns households from GSI1 with names from META', async () => {
    ddbMock.on(QueryCommand).resolves({
      Items: [
        { PK: 'HH#h1', SK: 'MEMBER#sub-1', GSI1PK: 'USER#sub-1', GSI1SK: 'HH#h1', role: 'owner' },
        { PK: 'HH#h2', SK: 'MEMBER#sub-1', GSI1PK: 'USER#sub-1', GSI1SK: 'HH#h2', role: 'member' },
      ],
    });
    ddbMock.on(BatchGetCommand).resolves({
      Responses: {
        fridgeboard: [
          { PK: 'HH#h2', SK: 'META', name: 'Cabin' },
          { PK: 'HH#h1', SK: 'META', name: 'Home' },
        ],
      },
    });

    const result = await handler(buildEvent());

    expect(ddbMock.commandCalls(QueryCommand)[0]?.args[0].input).toMatchObject({
      TableName: 'fridgeboard',
      IndexName: 'GSI1',
      ExpressionAttributeValues: { ':pk': 'USER#sub-1' },
    });
    expect(ddbMock.commandCalls(BatchGetCommand)[0]?.args[0].input).toEqual({
      RequestItems: {
        fridgeboard: {
          Keys: [
            { PK: 'HH#h1', SK: 'META' },
            { PK: 'HH#h2', SK: 'META' },
          ],
        },
      },
    });
    expect(JSON.parse(result.body ?? '').households).toEqual([
      { id: 'h1', name: 'Home', role: 'owner' },
      { id: 'h2', name: 'Cabin', role: 'member' },
    ]);
  });

  it('dedupes duplicate memberships for one household', async () => {
    ddbMock.on(QueryCommand).resolves({
      Items: [
        { GSI1SK: 'HH#h1', role: 'owner' },
        { GSI1SK: 'HH#h1', role: 'owner' },
      ],
    });
    ddbMock.on(BatchGetCommand).resolves({
      Responses: { fridgeboard: [{ PK: 'HH#h1', SK: 'META', name: 'Home' }] },
    });

    const result = await handler(buildEvent());

    expect(ddbMock.commandCalls(BatchGetCommand)[0]?.args[0].input).toEqual({
      RequestItems: { fridgeboard: { Keys: [{ PK: 'HH#h1', SK: 'META' }] } },
    });
    expect(JSON.parse(result.body ?? '').households).toEqual([
      { id: 'h1', name: 'Home', role: 'owner' },
    ]);
  });

  it('skips memberships with a missing or malformed GSI1SK', async () => {
    ddbMock.on(QueryCommand).resolves({
      Items: [{ role: 'owner' }, { GSI1SK: 'junk', role: 'owner' }],
    });

    const result = await handler(buildEvent());

    expect(JSON.parse(result.body ?? '').households).toEqual([]);
    expect(ddbMock.commandCalls(BatchGetCommand)).toHaveLength(0);
  });

  it('follows LastEvaluatedKey until the membership query is done', async () => {
    ddbMock
      .on(QueryCommand)
      .resolvesOnce({
        Items: [{ GSI1SK: 'HH#h1', role: 'owner' }],
        LastEvaluatedKey: { PK: 'HH#h1', SK: 'MEMBER#sub-1' },
      })
      .resolvesOnce({ Items: [{ GSI1SK: 'HH#h2', role: 'member' }] });
    ddbMock.on(BatchGetCommand).resolves({
      Responses: {
        fridgeboard: [
          { PK: 'HH#h1', SK: 'META', name: 'Home' },
          { PK: 'HH#h2', SK: 'META', name: 'Cabin' },
        ],
      },
    });

    const result = await handler(buildEvent());

    const queries = ddbMock.commandCalls(QueryCommand);
    expect(queries).toHaveLength(2);
    expect(queries[1]?.args[0].input.ExclusiveStartKey).toEqual({
      PK: 'HH#h1',
      SK: 'MEMBER#sub-1',
    });
    expect(JSON.parse(result.body ?? '').households).toHaveLength(2);
  });

  it('chunks BatchGet at 100 keys', async () => {
    const Items = Array.from({ length: 101 }, (_, i) => ({ GSI1SK: `HH#h${i}`, role: 'member' }));
    ddbMock.on(QueryCommand).resolves({ Items });
    ddbMock.on(BatchGetCommand).resolves({ Responses: { fridgeboard: [] } });

    await handler(buildEvent());

    const calls = ddbMock.commandCalls(BatchGetCommand);
    expect(calls.map((c) => c.args[0].input.RequestItems?.fridgeboard?.Keys?.length)).toEqual([
      100, 1,
    ]);
  });

  it('retries unprocessed BatchGet keys once', async () => {
    ddbMock.on(QueryCommand).resolves({ Items: [{ GSI1SK: 'HH#h1', role: 'owner' }] });
    ddbMock
      .on(BatchGetCommand)
      .resolvesOnce({
        Responses: { fridgeboard: [] },
        UnprocessedKeys: { fridgeboard: { Keys: [{ PK: 'HH#h1', SK: 'META' }] } },
      })
      .resolvesOnce({ Responses: { fridgeboard: [{ PK: 'HH#h1', SK: 'META', name: 'Home' }] } });

    const result = await handler(buildEvent());

    expect(ddbMock.commandCalls(BatchGetCommand)).toHaveLength(2);
    expect(JSON.parse(result.body ?? '').households).toEqual([
      { id: 'h1', name: 'Home', role: 'owner' },
    ]);
  });

  it('throws when BatchGet keys are still unprocessed after the retry', async () => {
    ddbMock.on(QueryCommand).resolves({ Items: [{ GSI1SK: 'HH#h1', role: 'owner' }] });
    ddbMock.on(BatchGetCommand).resolves({
      Responses: { fridgeboard: [] },
      UnprocessedKeys: { fridgeboard: { Keys: [{ PK: 'HH#h1', SK: 'META' }] } },
    });

    await expect(handler(buildEvent())).rejects.toThrow();
    expect(ddbMock.commandCalls(BatchGetCommand)).toHaveLength(2);
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
    expect(ddbMock.commandCalls(QueryCommand)).toHaveLength(0);
  });

  it('returns 401 when the sub claim is missing', async () => {
    const result = await handler(buildEvent({}));

    expect(result).toEqual({ statusCode: 401 });
    expect(ddbMock.calls()).toHaveLength(0);
  });
});
