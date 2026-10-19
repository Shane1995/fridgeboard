import { TransactionCanceledException } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import type { APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda';
import { mockClient } from 'aws-sdk-client-mock';
import { handler } from './index.ts';

vi.mock('node:crypto', async (importOriginal) => ({
  ...(await importOriginal<typeof import('node:crypto')>()),
  randomUUID: () => 'hh-1',
}));

const ddbMock = mockClient(DynamoDBDocumentClient);

const buildEvent = (
  body: unknown,
  claims: Record<string, string | number | boolean | string[]> = { sub: 'sub-1' },
): APIGatewayProxyEventV2WithJWTAuthorizer => ({
  version: '2.0',
  routeKey: 'POST /api/v1/households',
  rawPath: '/api/v1/households',
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
      method: 'POST',
      path: '/api/v1/households',
      protocol: 'HTTP/1.1',
      sourceIp: '127.0.0.1',
      userAgent: 'test',
    },
    requestId: 'req-1',
    routeKey: 'POST /api/v1/households',
    stage: '$default',
    time: '',
    timeEpoch: 0,
    authorizer: { principalId: 'p', integrationLatency: 0, jwt: { claims, scopes: [] } },
  },
});

const cancelled = (...codes: string[]): TransactionCanceledException =>
  new TransactionCanceledException({
    message: 'cancelled',
    $metadata: {},
    CancellationReasons: codes.map((Code) => ({ Code })),
  });

const transactItems = () =>
  ddbMock.commandCalls(TransactWriteCommand)[0]?.args[0].input.TransactItems;

describe('households handler', () => {
  beforeEach(() => {
    ddbMock.reset();
    vi.stubEnv('TABLE_NAME', 'fridgeboard');
    vi.stubEnv('API_ORIGIN_SECRET', 'origin-secret');
    ddbMock.on(TransactWriteCommand).resolves({});
  });

  it('returns 403 without the origin secret', async () => {
    const result = await handler({ ...buildEvent({ name: 'Home' }), headers: {} });

    expect(result.statusCode).toBe(403);
    expect(ddbMock.commandCalls(TransactWriteCommand)).toHaveLength(0);
  });

  it('returns 401 without a sub claim', async () => {
    const result = await handler(buildEvent({ name: 'Home' }, {}));

    expect(result.statusCode).toBe(401);
  });

  it.each([{ name: '' }, { name: '   ' }, { name: 'x'.repeat(41) }, { name: 7 }, {}, 'nope'])(
    'rejects an invalid name %j with 400',
    async (body) => {
      const result = await handler(buildEvent(body));

      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'invalid-name' });
      expect(ddbMock.commandCalls(TransactWriteCommand)).toHaveLength(0);
    },
  );

  it('returns 400 for a body that is not JSON', async () => {
    const result = await handler({ ...buildEvent({}), body: 'not json' });

    expect(result.statusCode).toBe(400);
  });

  it('creates the household, owner membership and one-owned guard in one transaction', async () => {
    const result = await handler(buildEvent({ name: '  Our home  ' }));

    expect(result.statusCode).toBe(201);
    expect(result.headers?.Location).toBe('/api/v1/households/hh-1');
    expect(JSON.parse(result.body ?? '')).toEqual({ id: 'hh-1', name: 'Our home', role: 'owner' });
    const items = transactItems();
    expect(items).toHaveLength(4);
    expect(items?.[0]?.ConditionCheck).toMatchObject({
      Key: { PK: 'USER#sub-1', SK: 'PROFILE' },
      ConditionExpression: 'attribute_exists(PK) AND canCreateHousehold = :allowed',
      ExpressionAttributeValues: { ':allowed': true },
    });
    expect(items?.[1]?.Put).toMatchObject({
      Item: { PK: 'HH#hh-1', SK: 'META', name: 'Our home', ownerSub: 'sub-1' },
      ConditionExpression: 'attribute_not_exists(PK)',
    });
    expect(items?.[2]?.Put).toMatchObject({
      Item: {
        PK: 'HH#hh-1',
        SK: 'MEMBER#sub-1',
        GSI1PK: 'USER#sub-1',
        GSI1SK: 'HH#hh-1',
        role: 'owner',
      },
    });
    expect(items?.[3]?.Put).toMatchObject({
      Item: { PK: 'USER#sub-1', SK: 'OWNED_HOUSEHOLD', householdId: 'hh-1' },
      ConditionExpression: 'attribute_not_exists(PK)',
    });
  });

  it('lets an admin create without the canCreateHousehold flag', async () => {
    await handler(buildEvent({ name: 'Home' }, { sub: 'sub-1', 'cognito:groups': ['admin'] }));

    expect(transactItems()?.[0]?.ConditionCheck).toMatchObject({
      ConditionExpression: 'attribute_exists(PK)',
    });
  });

  it('returns 403 when the profile may not create a household', async () => {
    ddbMock
      .on(TransactWriteCommand)
      .rejects(cancelled('ConditionalCheckFailed', 'None', 'None', 'None'));

    const result = await handler(buildEvent({ name: 'Home' }));

    expect(result.statusCode).toBe(403);
    expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'not-allowed' });
  });

  it('returns 409 when the user already owns a household', async () => {
    ddbMock
      .on(TransactWriteCommand)
      .rejects(cancelled('None', 'None', 'None', 'ConditionalCheckFailed'));

    const result = await handler(buildEvent({ name: 'Home' }));

    expect(result.statusCode).toBe(409);
    expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'household-exists' });
  });

  it('rethrows unexpected DynamoDB errors', async () => {
    ddbMock.on(TransactWriteCommand).rejects(new Error('boom'));

    await expect(handler(buildEvent({ name: 'Home' }))).rejects.toThrow('boom');
  });
});
