import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { decodeToken } from '../../decodeToken/index.ts';
import { verify } from './index.ts';

const ddbMock = mockClient(DynamoDBDocumentClient);
const flow = `fb_auth_flow=${Buffer.from('a@x.com').toString('base64url')}`;
const request = (code: string, cookies = [flow]) => ({
  cookies,
  body: JSON.stringify({ code }),
  isBase64Encoded: false,
});

describe('verify stub', () => {
  beforeEach(() => {
    ddbMock.reset();
    ddbMock.on(PutCommand).resolves({});
  });

  it('returns expired without a flow cookie', async () => {
    const result = await verify(request('000000', []));

    expect(JSON.parse(String(result.body))).toEqual({ reason: 'expired' });
  });

  it('returns bad-code for any code but 000000', async () => {
    const result = await verify(request('123456'));

    expect(JSON.parse(String(result.body))).toEqual({ reason: 'bad-code' });
  });

  it('signs in an existing profile without confirming sign-up again', async () => {
    ddbMock.on(GetCommand).resolves({ Item: { PK: 'p' } });

    const result = await verify(request('000000'));

    expect(decodeToken(JSON.parse(String(result.body)).accessToken)?.email).toBe('a@x.com');
    expect(ddbMock.commandCalls(PutCommand)).toHaveLength(0);
  });

  it('runs the postConfirmation handler for a new profile', async () => {
    ddbMock.on(GetCommand).resolves({});

    const result = await verify(request('000000'));

    expect(result.statusCode).toBe(200);
    expect(ddbMock.commandCalls(PutCommand)[0]?.args[0].input.Item).toMatchObject({
      email: 'a@x.com',
      canCreateHousehold: false,
    });
  });
});
