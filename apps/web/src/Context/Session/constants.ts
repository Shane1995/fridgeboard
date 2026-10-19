import { SessionStatus } from '../../services/session/constants';
import type { SessionRuntime } from './types';

export const INITIAL_RUNTIME: SessionRuntime = {
  token: undefined,
  status: SessionStatus.Loading,
  epoch: 0,
  lastRefreshAt: undefined,
  noSession: false,
  flight: undefined,
  timer: undefined,
};
