import { DynamoDBDocumentClient, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { TransactionCanceledException } from '@aws-sdk/client-dynamodb';
import type { APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda';
import { mockClient } from 'aws-sdk-client-mock';
import { handler } from './index.ts';

const ddbMock = mockClient(DynamoDBDocumentClient);

const buildEvent = (body: unknown, sub = 'sub-1'): APIGatewayProxyEventV2WithJWTAuthorizer => ({
  version: '2.0',
  routeKey: 'PUT /api/v1/username',
  rawPath: '/api/v1/username',
  rawQueryString: '',
  headers: { 'x-api-origin-verify': 'origin-secret' },
  body: JSON.stringify(body),
  isBase64Encoded: false,
  requestContext: {
    accountId: '123',
    apiId: 'api',
    domainName: 'app.fridgeboard.uk',
    domainPrefix: 'app',
    http: {
      method: 'PUT',
      path: '/api/v1/username',
      protocol: 'HTTP/1.1',
      sourceIp: '127.0.0.1',
      userAgent: 'test',
    },
    requestId: 'req-1',
    routeKey: 'PUT /api/v1/username',
    stage: '$default',
    time: '',
    timeEpoch: 0,
    authorizer: { principalId: 'p', integrationLatency: 0, jwt: { claims: { sub }, scopes: [] } },
  },
});

const cancelled = (...codes: string[]): TransactionCanceledException =>
  new TransactionCanceledException({
    message: 'cancelled',
    $metadata: {},
    CancellationReasons: codes.map((Code) => ({ Code })),
  });

describe('username handler', () => {
  beforeEach(() => {
    ddbMock.reset();
    vi.stubEnv('TABLE_NAME', 'fridgeboard');
    vi.stubEnv('API_ORIGIN_SECRET', 'origin-secret');
    ddbMock.on(TransactWriteCommand).resolves({});
  });

  it('returns 403 without the origin secret', async () => {
    const result = await handler({ ...buildEvent({ username: 'jess' }), headers: {} });

    expect(result.statusCode).toBe(403);
    expect(ddbMock.commandCalls(TransactWriteCommand)).toHaveLength(0);
  });

  it.each(['', 'ab', 'a'.repeat(21), 'has space', 'bad-dash', 42])(
    'rejects invalid username %j',
    async (username) => {
      const result = await handler(buildEvent({ username }));

      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'invalid-username' });
      expect(ddbMock.commandCalls(TransactWriteCommand)).toHaveLength(0);
    },
  );

  it('claims the lowercase username and sets it on the profile atomically', async () => {
    const result = await handler(buildEvent({ username: 'Jess_99' }));

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body ?? '')).toEqual({ username: 'Jess_99' });
    const items = ddbMock.commandCalls(TransactWriteCommand)[0]?.args[0].input.TransactItems;
    expect(items?.[0]?.Put).toMatchObject({
      TableName: 'fridgeboard',
      Item: { PK: 'USERNAME#jess_99', SK: 'USERNAME', sub: 'sub-1' },
      ConditionExpression: 'attribute_not_exists(PK)',
    });
    expect(items?.[1]?.Update).toMatchObject({
      Key: { PK: 'USER#sub-1', SK: 'PROFILE' },
      ConditionExpression: 'attribute_exists(PK) AND attribute_not_exists(username)',
      ExpressionAttributeValues: { ':username': 'Jess_99' },
    });
  });

  it('returns 409 username-taken when the claim already exists', async () => {
    ddbMock.on(TransactWriteCommand).rejects(cancelled('ConditionalCheckFailed', 'None'));

    const result = await handler(buildEvent({ username: 'jess' }));

    expect(result.statusCode).toBe(409);
    expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'username-taken' });
  });

  it('returns 409 username-set when the profile already has a username', async () => {
    ddbMock.on(TransactWriteCommand).rejects(cancelled('None', 'ConditionalCheckFailed'));

    const result = await handler(buildEvent({ username: 'jess' }));

    expect(result.statusCode).toBe(409);
    expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'username-set' });
  });

  it('rethrows unexpected errors', async () => {
    ddbMock.on(TransactWriteCommand).rejects(new Error('boom'));

    await expect(handler(buildEvent({ username: 'jess' }))).rejects.toThrow('boom');
  });
});
