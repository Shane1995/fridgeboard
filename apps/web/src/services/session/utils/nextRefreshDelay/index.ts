import { MS_PER_SECOND } from '../../constants';

export const nextRefreshDelay = (
  expiresInSeconds: number,
  refreshLeadMs: number,
  refreshMinIntervalMs: number,
): number => Math.max(refreshMinIntervalMs, expiresInSeconds * MS_PER_SECOND - refreshLeadMs);
