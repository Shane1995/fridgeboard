import { useSyncExternalStore } from 'react';
import { getSessionStatus } from '../../services/session/getSessionStatus';
import { subscribeSession } from '../../services/session/subscribeSession';
import type { UseSessionResult } from './types';

export const useSession = (): UseSessionResult => {
  const status = useSyncExternalStore(subscribeSession, getSessionStatus);
  return { status };
};
