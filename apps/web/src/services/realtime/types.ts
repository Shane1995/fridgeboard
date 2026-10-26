import type { ChangeType, IChange, IChangesResponse } from '@fridgeboard/contract/changes';
import type { SubscribeOptions } from '../eventBus/createEventBus/types';
import type { MessageType } from './constants';

export type RealtimeMessage =
  | { type: typeof MessageType.ConnectionAck; connectionTimeoutMs: number | undefined }
  | { type: typeof MessageType.KeepAlive }
  | { type: typeof MessageType.SubscribeSuccess }
  | { type: typeof MessageType.Data; change: IChange | undefined }
  | { type: typeof MessageType.SubscribeError }
  | { type: typeof MessageType.Error };

export type OpenChannelOptions = {
  realtimeHost: string;
  httpHost: string;
  token: string;
  channel: string;
  onSubscribed: () => void;
  onChange: (change: IChange) => void;
  onClosed: () => void;
};

export type OpenChannel = (options: OpenChannelOptions) => { close: () => void };

export type FetchChanges = (options: { since: number | undefined }) => Promise<IChangesResponse>;

export type ChangeEvent = { type: ChangeType; id: string | undefined };

export type CreateLiveSyncOptions = {
  realtimeHost: string;
  httpHost: string;
  householdId: string;
  getToken: () => Promise<string | undefined>;
  openChannel: OpenChannel;
  fetchChanges: FetchChanges;
  onChanges: (events: readonly ChangeEvent[]) => void;
};

export type LiveSync = { start: () => void; stop: () => void; resume: () => void };

export type LiveSyncState = {
  rev: number | undefined;
  seen: number;
  stopped: boolean;
  connecting: boolean;
  attempt: number;
  socket: { close: () => void } | undefined;
  timer: ReturnType<typeof setTimeout> | undefined;
  catchingUp: Promise<void> | undefined;
};

export type InvalidateOnOptions = {
  types: readonly ChangeType[];
  keys: readonly string[];
};

export type Registration = { count: number; unsubscribes: (() => void)[] };

export type CreateChangeHubOptions = {
  delayMs: number;
  invalidate: (keys: readonly string[]) => void;
};

export type ChangeHub = {
  emit: (events: readonly ChangeEvent[]) => void;
  subscribe: (options: SubscribeOptions<ChangeType, ChangeEvent>) => () => void;
  invalidateOn: (options: InvalidateOnOptions) => () => void;
  dispose: () => void;
};
