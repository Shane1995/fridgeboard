import type { IncomingMessage, Server } from 'node:http';
import { WebSocketServer, type WebSocket } from 'ws';
import { isMember } from '../isMember/index.ts';
import { parseAuthProtocol } from '../parseAuthProtocol/index.ts';
import {
  CONNECTION_TIMEOUT_MS,
  ClientMessage,
  ErrorType,
  KEEP_ALIVE_MS,
  REALTIME_PATH,
  ServerMessage,
  SUBPROTOCOL,
} from '../realtime/constants.ts';
import type { RealtimeHub } from '../realtime/types.ts';
import type { ClientFrame } from './types.ts';

const readFrame = (data: WebSocket.RawData): ClientFrame | undefined => {
  try {
    const parsed: unknown = JSON.parse(data.toString());
    return typeof parsed === 'object' && parsed !== null ? parsed : undefined;
  } catch {
    return undefined;
  }
};

const subscribeError = ({ id, errorType }: { id: unknown; errorType: string }) => ({
  type: ServerMessage.SubscribeError,
  id,
  errors: [{ errorType, message: errorType }],
});

const onConnection =
  ({ hub, keepAliveMs }: { hub: RealtimeHub; keepAliveMs: number }) =>
  (socket: WebSocket, request: IncomingMessage): void => {
    const connectionToken = parseAuthProtocol({
      protocols: String(request.headers['sec-websocket-protocol'] ?? '')
        .split(',')
        .map((protocol) => protocol.trim()),
    });
    const unsubscribes = new Map<string, () => void>();
    const send = (message: Record<string, unknown>): void => {
      socket.send(JSON.stringify(message));
    };
    const keepAlive = setInterval(() => send({ type: ServerMessage.KeepAlive }), keepAliveMs);

    const subscribe = async (frame: ClientFrame): Promise<void> => {
      const { id, channel, authorization } = frame;
      if (typeof id !== 'string' || typeof channel !== 'string') {
        send(subscribeError({ id, errorType: ErrorType.BadRequest }));
        return;
      }
      const token = authorization?.Authorization ?? connectionToken;
      const member = await isMember({ token, channel }).catch((error: unknown) => {
        console.error('subscribe check failed', error);
        return undefined;
      });
      if (member === undefined) {
        send(subscribeError({ id, errorType: ErrorType.Internal }));
        return;
      }
      if (!member) {
        send(subscribeError({ id, errorType: ErrorType.Unauthorized }));
        return;
      }
      unsubscribes.get(id)?.();
      unsubscribes.set(id, hub.subscribe({ channel, subscriber: { id, send } }));
      send({ type: ServerMessage.SubscribeSuccess, id });
    };

    socket.on('message', (data) => {
      const frame = readFrame(data);
      if (frame?.type === ClientMessage.ConnectionInit) {
        send({ type: ServerMessage.ConnectionAck, connectionTimeoutMs: CONNECTION_TIMEOUT_MS });
      } else if (frame?.type === ClientMessage.Subscribe) {
        void subscribe(frame);
      } else if (frame?.type === ClientMessage.Unsubscribe && typeof frame.id === 'string') {
        unsubscribes.get(frame.id)?.();
        unsubscribes.delete(frame.id);
        send({ type: ServerMessage.UnsubscribeSuccess, id: frame.id });
      }
    });
    socket.on('close', () => {
      clearInterval(keepAlive);
      unsubscribes.forEach((unsubscribe) => unsubscribe());
      unsubscribes.clear();
    });
  };

export const attachRealtime = ({
  server,
  hub,
  keepAliveMs = KEEP_ALIVE_MS,
}: {
  server: Server;
  hub: RealtimeHub;
  keepAliveMs?: number;
}): void => {
  const sockets = new WebSocketServer({
    noServer: true,
    handleProtocols: (protocols) => (protocols.has(SUBPROTOCOL) ? SUBPROTOCOL : false),
  });
  sockets.on('connection', onConnection({ hub, keepAliveMs }));
  server.on('upgrade', (request, socket, head) => {
    const { pathname } = new URL(request.url ?? '/', 'http://localhost');
    if (pathname !== REALTIME_PATH) {
      socket.destroy();
      return;
    }
    sockets.handleUpgrade(request, socket, head, (ws) => sockets.emit('connection', ws, request));
  });
};
