import type { SessionSnapshot } from './types';

export const SESSION_KEY = 'current';
export const REFRESH_KEY = 'refresh';

export const INITIAL_SESSION: SessionSnapshot = {
  accessToken: undefined,
  status: 'loading',
  lastRefreshAt: undefined,
};

export const REFRESH_LOCK_NAME = 'fb-refresh';
export const REFRESH_LEAD_MS = 60_000;
export const REFRESH_MIN_INTERVAL_MS = 60_000;
export const MS_PER_SECOND = 1000;

export const JSON_HEADERS = { 'Content-Type': 'application/json' };
export const SAME_ORIGIN = 'same-origin';
export const POST = 'POST';

export const UNAUTHORISED_STATUS = 401;
export const NEXT_STEP_STATUS = 202;
export const UNKNOWN_REASON = 'unknown';

export const VISIBILITY_EVENT = 'visibilitychange';
export const VISIBLE = 'visible';
