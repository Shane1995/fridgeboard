import { SESSION_KEY } from '../constants';
import { getSession } from '../getSession';
import { sessionListeners, sessionStore } from '../store';
import type { SessionSnapshot } from '../types';

export const updateSession = (patch: Partial<SessionSnapshot>): void => {
  const next = { ...getSession(), ...patch };
  sessionStore.set(SESSION_KEY, next);
  sessionListeners.forEach((listener) => listener(next));
};
