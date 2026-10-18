import { SESSION_KEY } from '../constants';
import { getSession } from '../getSession';
import { sessionListeners, sessionStore } from '../store';
import type { SessionSnapshot } from '../types';

export const updateSession = (patch: Partial<SessionSnapshot>): void => {
  sessionStore.set(SESSION_KEY, { ...getSession(), ...patch });
  sessionListeners.forEach((listener) => listener());
};
