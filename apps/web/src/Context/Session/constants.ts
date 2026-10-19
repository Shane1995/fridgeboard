import { SessionStatus } from '../../services/session/constants';
import type { SessionRuntime } from './types';

export const RECENT_CODE_WINDOW_MS = 240_000;

export const INITIAL_RUNTIME: SessionRuntime = {
  token: undefined,
  status: SessionStatus.Loading,
  epoch: 0,
  lastRefreshAt: undefined,
  noSession: false,
  flight: undefined,
  timer: undefined,
};
