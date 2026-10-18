import { INITIAL_SESSION, SESSION_KEY } from '../constants';
import type { RefreshKey, SessionKey, SessionSnapshot } from '../types';

export const sessionStore = new Map<SessionKey, SessionSnapshot>([[SESSION_KEY, INITIAL_SESSION]]);

export const sessionListeners = new Set<() => void>();

export const refreshFlights = new Map<RefreshKey, Promise<boolean>>();

export const refreshTimers = new Map<RefreshKey, ReturnType<typeof setTimeout>>();
