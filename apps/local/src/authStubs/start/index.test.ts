import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { start } from './index.ts';

const ddbMock = mockClient(DynamoDBDocumentClient);
const body = (email: string) => ({ body: JSON.stringify({ email }), isBase64Encoded: false });

describe('start stub', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  it('rejects an email without @', async () => {
    expect((await start(body('nope'))).statusCode).toBe(400);
  });

  it('rejects an email with neither profile nor invite', async () => {
    ddbMock.on(GetCommand).resolves({});

    const result = await start(body('a@x.com'));

    expect(result.statusCode).toBe(403);
    expect(JSON.parse(String(result.body))).toEqual({ reason: 'no-invite' });
  });

  it('sets the flow cookie for a known profile', async () => {
    ddbMock.on(GetCommand).resolves({ Item: { PK: 'p' } });

    const result = await start(body(' A@X.com '));

    expect(result.statusCode).toBe(204);
    expect(result.cookies?.[0]).toContain(
      `fb_auth_flow=${Buffer.from('a@x.com').toString('base64url')}`,
    );
  });

  it('accepts an invited email without a profile', async () => {
    ddbMock
      .on(GetCommand)
      .resolvesOnce({})
      .resolvesOnce({ Item: { type: 'app' } });

    expect((await start(body('a@x.com'))).statusCode).toBe(204);
  });
});
