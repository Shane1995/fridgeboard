export const SUBPROTOCOL = 'aws-appsync-event-ws';
export const AUTH_PROTOCOL_PREFIX = 'header-';
export const REALTIME_PATH = '/event/realtime';
export const SUBSCRIPTION_ID = 'household';
export const CHANNEL_PREFIX = '/hh/';
export const DEFAULT_CONNECTION_TIMEOUT_MS = 300_000;
export const BACKOFF_BASE_MS = 1_001;
export const BACKOFF_MAX_MS = 30_000;
export const CATCH_UP_ROUNDS = 3;

export const MessageType = {
  ConnectionAck: 'connection_ack',
  KeepAlive: 'ka',
  SubscribeSuccess: 'subscribe_success',
  Data: 'data',
  SubscribeError: 'subscribe_error',
  Error: 'error',
} as const;
