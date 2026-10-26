import { CHANGE_TYPES } from '@fridgeboard/contract/changes/constants';
import type { ChangeType, IChange } from '@fridgeboard/contract/changes';
import { MessageType } from '../constants';
import type { RealtimeMessage } from '../types';
import type { ParseMessageOptions } from './types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isChangeType = (value: unknown): value is ChangeType =>
  CHANGE_TYPES.some((type) => type === value);

const toChange = (value: unknown): IChange | undefined => {
  const payload = typeof value === 'string' ? safeParse(value) : value;
  return isRecord(payload) &&
    typeof payload['rev'] === 'number' &&
    typeof payload['id'] === 'string' &&
    isChangeType(payload['type'])
    ? { rev: payload['rev'], id: payload['id'], type: payload['type'] }
    : undefined;
};

const safeParse = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
};

export const parseMessage = ({ data }: ParseMessageOptions): RealtimeMessage | undefined => {
  const message = typeof data === 'string' ? safeParse(data) : undefined;
  if (!isRecord(message)) {
    return undefined;
  }
  switch (message['type']) {
    case MessageType.ConnectionAck: {
      const timeout = message['connectionTimeoutMs'];
      return {
        type: MessageType.ConnectionAck,
        connectionTimeoutMs: typeof timeout === 'number' ? timeout : undefined,
      };
    }
    case MessageType.KeepAlive:
      return { type: MessageType.KeepAlive };
    case MessageType.SubscribeSuccess:
      return { type: MessageType.SubscribeSuccess };
    case MessageType.Data:
      return { type: MessageType.Data, change: toChange(message['event']) };
    case MessageType.SubscribeError:
      return { type: MessageType.SubscribeError };
    case MessageType.Error:
      return { type: MessageType.Error };
    default:
      return undefined;
  }
};
