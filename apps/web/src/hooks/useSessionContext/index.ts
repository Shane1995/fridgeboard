import { useContext } from 'react';
import { SessionContext } from '../../Context/Session';
import type { SessionContextValue } from '../../Context/Session/types';
import { MISSING_PROVIDER_MESSAGE } from './constants';

export const useSessionContext = (): SessionContextValue => {
  const session = useContext(SessionContext);
  if (!session) {
    throw new Error(MISSING_PROVIDER_MESSAGE);
  }
  return session;
};
