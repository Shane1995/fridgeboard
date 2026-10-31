import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import WebSocket from 'ws';
import { claimsFor } from '../claimsFor/index.ts';
import { encodeToken } from '../encodeToken/index.ts';
import { createRealtimeHub } from '../realtimeHub/index.ts';
import { attachRealtime } from './index.ts';

const ddbMock = mockClient(DynamoDBDocumentClient);
const token = encodeToken(claimsFor('admin@fridgeboard.local'));
const header = `header-${Buffer.from(JSON.stringify({ Authorization: token, host: 'h' })).toString('base64url')}`;

const servers: Server[] = [];
const sockets: WebSocket[] = [];

const start = async (keepAliveMs = 60_000) => {
  const hub = createRealtimeHub();
  const server = createServer();
  attachRealtime({ server, hub, keepAliveMs });
  await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
  servers.push(server);
  const { port } = server.address() as AddressInfo;
  const socket = new WebSocket(`ws://127.0.0.1:${port}/event/realtime`, [
    'aws-appsync-event-ws',
    header,
  ]);
  sockets.push(socket);
  const messages: Record<string, unknown>[] = [];
  socket.on('message', (data) => messages.push(JSON.parse(data.toString())));
  await new Promise((done) => socket.on('open', done));
  const next = async (type: string): Promise<Record<string, unknown>> => {
    await vi.waitFor(() => expect(messages.some((message) => message['type'] === type)).toBe(true));
    return messages.find((message) => message['type'] === type) ?? {};
  };
  return { hub, socket, messages, next };
};

describe('attachRealtime', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  afterEach(() => {
    sockets.splice(0).forEach((socket) => socket.terminate());
    servers.splice(0).forEach((server) => server.close());
  });

  it('acks the connection, subscribes a member and delivers published events', async () => {
    ddbMock.on(GetCommand).resolves({ Item: { PK: 'p' } });
    const { hub, socket, next, messages } = await start();

    socket.send(JSON.stringify({ type: 'connection_init' }));
    expect(await next('connection_ack')).toMatchObject({ connectionTimeoutMs: 300_000 });
    socket.send(
      JSON.stringify({
        type: 'subscribe',
        id: 'household',
        channel: '/hh/local-household',
        authorization: { Authorization: token },
      }),
    );
    expect(await next('subscribe_success')).toMatchObject({ id: 'household' });

    hub.publish({ channel: '/hh/local-household', events: ['{"rev":1,"type":"item","id":"x"}'] });

    expect(await next('data')).toEqual({
      type: 'data',
      id: 'household',
      event: '{"rev":1,"type":"item","id":"x"}',
    });
    expect(messages.map((message) => message['type'])).toEqual([
      'connection_ack',
      'subscribe_success',
      'data',
    ]);
  });

  it('rejects a subscribe from a non-member', async () => {
    ddbMock.on(GetCommand).resolves({});
    const { socket, next } = await start();

    socket.send(
      JSON.stringify({
        type: 'subscribe',
        id: 'household',
        channel: '/hh/local-household',
        authorization: { Authorization: token },
      }),
    );

    expect(await next('subscribe_error')).toMatchObject({
      id: 'household',
      errors: [{ errorType: 'UnauthorizedException' }],
    });
  });

  it('sends keep-alive frames', async () => {
    const { next } = await start(20);

    expect(await next('ka')).toEqual({ type: 'ka' });
  });
});
