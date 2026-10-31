export const SUBPROTOCOL = 'aws-appsync-event-ws';
export const AUTH_PROTOCOL_PREFIX = 'header-';
export const REALTIME_PATH = '/event/realtime';
export const PUBLISH_PATH = '/event';
export const CHANNEL_PREFIX = '/hh/';
export const CONNECTION_TIMEOUT_MS = 300_000;
export const KEEP_ALIVE_MS = 60_000;
export const MAX_EVENTS_PER_PUBLISH = 5;

export const ClientMessage = {
  ConnectionInit: 'connection_init',
  Subscribe: 'subscribe',
  Unsubscribe: 'unsubscribe',
} as const;

export const ServerMessage = {
  ConnectionAck: 'connection_ack',
  KeepAlive: 'ka',
  SubscribeSuccess: 'subscribe_success',
  SubscribeError: 'subscribe_error',
  UnsubscribeSuccess: 'unsubscribe_success',
  Data: 'data',
  Error: 'error',
} as const;

export const ErrorType = {
  Unauthorized: 'UnauthorizedException',
  BadRequest: 'BadRequestException',
  Internal: 'InternalFailure',
} as const;
