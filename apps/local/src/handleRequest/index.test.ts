import { Readable } from 'node:stream';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { ORIGIN_SECRET } from '../constants.ts';
import { encodeToken } from '../encodeToken/index.ts';
import { handleRequest } from './index.ts';

const ddbMock = mockClient(DynamoDBDocumentClient);
const fakeResponse = () => ({ writeHead: vi.fn(), end: vi.fn() });
const request = (method: string, url: string, headers: Record<string, string> = {}) =>
  Object.assign(Readable.from([]), { method, url, headers });
const bearer = `Bearer ${encodeToken({ sub: 's1', email: 'a@x.com', groups: [] })}`;

describe('handleRequest', () => {
  beforeEach(() => {
    ddbMock.reset();
    vi.stubEnv('API_ORIGIN_SECRET', ORIGIN_SECRET);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('serves the configuration with passkeys off', async () => {
    const response = fakeResponse();

    await handleRequest(request('GET', '/configuration.json'), response);

    expect(response.writeHead.mock.calls[0]?.[0]).toBe(200);
    expect(JSON.parse(response.end.mock.calls[0]?.[0]).featureFlags.ENABLE_PASSKEYS).toBe(false);
  });

  it('returns 404 for an unknown route', async () => {
    const response = fakeResponse();

    await handleRequest(request('POST', '/api/v1/auth/passkey/start'), response);

    expect(response.writeHead.mock.calls[0]?.[0]).toBe(404);
  });

  it('returns 401 for a JWT route without a token', async () => {
    const response = fakeResponse();

    await handleRequest(request('GET', '/api/v1/me'), response);

    expect(response.writeHead.mock.calls[0]?.[0]).toBe(401);
  });

  it('runs the real handler with the token claims', async () => {
    ddbMock.on(GetCommand).resolves({});
    const response = fakeResponse();

    await handleRequest(request('GET', '/api/v1/me', { authorization: bearer }), response);

    expect(response.writeHead.mock.calls[0]?.[0]).toBe(404);
    expect(ddbMock.commandCalls(GetCommand)[0]?.args[0].input.Key?.PK).toBe('USER#s1');
  });

  it('returns 500 when a handler throws', async () => {
    ddbMock.on(GetCommand).rejects(new Error('boom'));
    const response = fakeResponse();

    await handleRequest(request('GET', '/api/v1/me', { authorization: bearer }), response);

    expect(response.writeHead.mock.calls[0]?.[0]).toBe(500);
  });
});
