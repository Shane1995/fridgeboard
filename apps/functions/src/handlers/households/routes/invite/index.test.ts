import { TransactionCanceledException } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import {
  CreateEmailIdentityCommand,
  GetEmailIdentityCommand,
  NotFoundException,
  SESv2Client,
} from '@aws-sdk/client-sesv2';
import type { APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda';
import { mockClient } from 'aws-sdk-client-mock';
import { handler } from '../../index.ts';

const ddbMock = mockClient(DynamoDBDocumentClient);
const sesMock = mockClient(SESv2Client);

const NOW_MS = Date.UTC(2026, 9, 25, 12, 0, 0);
const NOW_S = NOW_MS / 1000;
const WEEK_S = 604800;

const buildEvent = ({
  body,
  householdId = 'hh-1',
  claims = { sub: 'sub-1' },
}: {
  body: unknown;
  householdId?: string;
  claims?: Record<string, string>;
}): APIGatewayProxyEventV2WithJWTAuthorizer => ({
  version: '2.0',
  routeKey: 'POST /api/v1/households/{householdId}/invites',
  rawPath: `/api/v1/households/${householdId}/invites`,
  rawQueryString: '',
  headers: { 'x-api-origin-verify': 'origin-secret' },
  pathParameters: { householdId },
  body: JSON.stringify(body),
  isBase64Encoded: false,
  requestContext: {
    accountId: '123',
    apiId: 'api',
    domainName: 'app.fridgeboard.uk',
    domainPrefix: 'app',
    http: {
      method: 'POST',
      path: `/api/v1/households/${householdId}/invites`,
      protocol: 'HTTP/1.1',
      sourceIp: '127.0.0.1',
      userAgent: 'test',
    },
    requestId: 'req-1',
    routeKey: 'POST /api/v1/households/{householdId}/invites',
    stage: '$default',
    time: '',
    timeEpoch: 0,
    authorizer: { principalId: 'p', integrationLatency: 0, jwt: { claims, scopes: [] } },
  },
});

const cancelled = (...codes: string[]) =>
  new TransactionCanceledException({
    message: 'cancelled',
    $metadata: {},
    CancellationReasons: codes.map((Code) => ({ Code })),
  });

const transactItems = () =>
  ddbMock.commandCalls(TransactWriteCommand)[0]?.args[0].input.TransactItems;

describe('invite to a household', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW_MS);
    ddbMock.reset();
    sesMock.reset();
    vi.stubEnv('TABLE_NAME', 'fridgeboard');
    vi.stubEnv('API_ORIGIN_SECRET', 'origin-secret');
    ddbMock.on(TransactWriteCommand).resolves({});
    sesMock
      .on(GetEmailIdentityCommand)
      .rejects(new NotFoundException({ message: 'missing', $metadata: {} }));
    sesMock.on(CreateEmailIdentityCommand).resolves({});
  });

  afterEach(() => vi.useRealTimers());

  it('checks the caller is a member, uses one invite and writes the invite in one transaction', async () => {
    const result = await handler(buildEvent({ body: { email: ' Tash@Example.com ' } }));

    expect(result.statusCode).toBe(201);
    expect(JSON.parse(String(result.body))).toEqual({ email: 'tash@example.com', verified: false });
    const items = transactItems();
    expect(items).toHaveLength(3);
    expect(items?.[0]?.ConditionCheck).toMatchObject({
      Key: { PK: 'HH#hh-1', SK: 'MEMBER#sub-1' },
      ConditionExpression: 'attribute_exists(PK)',
    });
    expect(items?.[1]?.Update).toMatchObject({
      Key: { PK: 'HH#hh-1', SK: 'META' },
      UpdateExpression: 'ADD invitesUsed :one',
      ConditionExpression:
        'attribute_exists(PK) AND (attribute_not_exists(inviteLimit) OR invitesUsed < inviteLimit)',
      ExpressionAttributeValues: { ':one': 1 },
    });
    expect(items?.[2]?.Put).toMatchObject({
      Item: {
        PK: 'INVITE#tash@example.com',
        SK: 'INVITE',
        type: 'household',
        hhId: 'hh-1',
        invitedBy: 'sub-1',
        expiresAt: NOW_S + WEEK_S,
        ttl: NOW_S + WEEK_S,
      },
      ConditionExpression: 'attribute_not_exists(PK) OR expiresAt <= :now',
      ExpressionAttributeValues: { ':now': NOW_S },
    });
  });

  it('creates the invitee a sending identity so the sandbox lets them sign in', async () => {
    await handler(buildEvent({ body: { email: 'tash@example.com' } }));

    expect(sesMock.commandCalls(CreateEmailIdentityCommand)[0]?.args[0].input).toEqual({
      EmailIdentity: 'tash@example.com',
    });
  });

  it('says verified when the address already is', async () => {
    sesMock.on(GetEmailIdentityCommand).resolves({ VerifiedForSendingStatus: true });

    const result = await handler(buildEvent({ body: { email: 'tash@example.com' } }));

    expect(JSON.parse(String(result.body)).verified).toBe(true);
  });

  it.each([{}, { email: 7 }, { email: 'nope' }, { email: '' }, 'text'])(
    'rejects %j with 400 invalid-email and writes nothing',
    async (body) => {
      const result = await handler(buildEvent({ body }));

      expect(result.statusCode).toBe(400);
      expect(JSON.parse(String(result.body))).toEqual({ reason: 'invalid-email' });
      expect(ddbMock.commandCalls(TransactWriteCommand)).toHaveLength(0);
    },
  );

  it('returns 404 for a household id that is not an id', async () => {
    const result = await handler(
      buildEvent({ body: { email: 'tash@example.com' }, householdId: 'a/b' }),
    );

    expect(result.statusCode).toBe(404);
    expect(ddbMock.commandCalls(TransactWriteCommand)).toHaveLength(0);
  });

  it('returns 404 when the caller is not a member and sends nothing to SES', async () => {
    ddbMock.on(TransactWriteCommand).rejects(cancelled('ConditionalCheckFailed', 'None', 'None'));

    const result = await handler(buildEvent({ body: { email: 'tash@example.com' } }));

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(String(result.body))).toEqual({ reason: 'not-found' });
    expect(sesMock.calls()).toHaveLength(0);
  });

  it('returns 409 limit-reached when the household has used all its invites', async () => {
    ddbMock.on(TransactWriteCommand).rejects(cancelled('None', 'ConditionalCheckFailed', 'None'));

    const result = await handler(buildEvent({ body: { email: 'tash@example.com' } }));

    expect(result.statusCode).toBe(409);
    expect(JSON.parse(String(result.body))).toEqual({ reason: 'limit-reached' });
    expect(sesMock.calls()).toHaveLength(0);
  });

  it('returns 409 already-invited when that email has a live invite', async () => {
    ddbMock.on(TransactWriteCommand).rejects(cancelled('None', 'None', 'ConditionalCheckFailed'));

    const result = await handler(buildEvent({ body: { email: 'tash@example.com' } }));

    expect(result.statusCode).toBe(409);
    expect(JSON.parse(String(result.body))).toEqual({ reason: 'already-invited' });
    expect(sesMock.calls()).toHaveLength(0);
  });

  it('returns 502 verification-failed when SES cannot create the identity', async () => {
    sesMock.on(CreateEmailIdentityCommand).rejects(new Error('ses down'));

    const result = await handler(buildEvent({ body: { email: 'tash@example.com' } }));

    expect(result.statusCode).toBe(502);
    expect(JSON.parse(String(result.body))).toEqual({ reason: 'verification-failed' });
  });

  it('rethrows an unexpected transaction failure', async () => {
    ddbMock.on(TransactWriteCommand).rejects(new Error('boom'));

    await expect(handler(buildEvent({ body: { email: 'tash@example.com' } }))).rejects.toThrow(
      'boom',
    );
  });
});
