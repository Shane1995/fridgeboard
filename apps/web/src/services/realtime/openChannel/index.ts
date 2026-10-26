import {
  DEFAULT_CONNECTION_TIMEOUT_MS,
  MessageType,
  REALTIME_PATH,
  SUBPROTOCOL,
  SUBSCRIPTION_ID,
} from '../constants';
import { buildAuthProtocol } from '../buildAuthProtocol';
import { parseMessage } from '../parseMessage';
import type { OpenChannel, RealtimeMessage } from '../types';

export const openChannel: OpenChannel = ({
  realtimeHost,
  httpHost,
  token,
  channel,
  onSubscribed,
  onChange,
  onClosed,
}) => {
  const socket = new WebSocket(`wss://${realtimeHost}${REALTIME_PATH}`, [
    SUBPROTOCOL,
    buildAuthProtocol({ token, httpHost }),
  ]);
  const watchdog: { timer: ReturnType<typeof setTimeout> | undefined; ms: number } = {
    timer: undefined,
    ms: DEFAULT_CONNECTION_TIMEOUT_MS,
  };
  const arm = (): void => {
    clearTimeout(watchdog.timer);
    watchdog.timer = setTimeout(() => socket.close(), watchdog.ms);
  };
  const subscribe = (): void => {
    socket.send(
      JSON.stringify({
        type: 'subscribe',
        id: SUBSCRIPTION_ID,
        channel,
        authorization: { Authorization: token },
      }),
    );
  };

  const handlers: { [Type in RealtimeMessage['type']]: (message: RealtimeMessage) => void } = {
    [MessageType.ConnectionAck]: (message) => {
      watchdog.ms =
        message.type === MessageType.ConnectionAck
          ? (message.connectionTimeoutMs ?? DEFAULT_CONNECTION_TIMEOUT_MS)
          : DEFAULT_CONNECTION_TIMEOUT_MS;
      arm();
      subscribe();
    },
    [MessageType.KeepAlive]: arm,
    [MessageType.SubscribeSuccess]: onSubscribed,
    [MessageType.Data]: (message) => {
      if (message.type === MessageType.Data && message.change !== undefined) {
        onChange(message.change);
      }
    },
    [MessageType.SubscribeError]: () => socket.close(),
    [MessageType.Error]: () => socket.close(),
  };

  socket.onopen = () => {
    socket.send(JSON.stringify({ type: 'connection_init' }));
  };
  socket.onmessage = ({ data }) => {
    const message = parseMessage({ data });
    if (message !== undefined) {
      handlers[message.type](message);
    }
  };
  socket.onerror = () => {
    socket.close();
  };
  socket.onclose = () => {
    clearTimeout(watchdog.timer);
    onClosed();
  };

  return {
    close: () => {
      socket.onclose = null;
      clearTimeout(watchdog.timer);
      socket.close();
    },
  };
};
