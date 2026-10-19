import { AUTH_TIME_CLAIM, RECENT_AUTH_MAX_AGE_SECONDS } from './constants.ts';

export const isRecentAuth = (claims: Record<string, unknown>, nowMs: number): boolean => {
  const claim = claims[AUTH_TIME_CLAIM];
  const authTime = typeof claim === 'string' ? Number(claim) : claim;
  if (typeof authTime !== 'number' || !Number.isFinite(authTime)) {
    return false;
  }
  const age = nowMs / 1000 - authTime;
  return age >= 0 && age <= RECENT_AUTH_MAX_AGE_SECONDS;
};
