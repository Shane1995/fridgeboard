import { INITIAL_SESSION, SESSION_KEY } from '../constants';
import { sessionStore } from '../store';
import type { SessionSnapshot } from '../types';

export const getSession = (): SessionSnapshot => sessionStore.get(SESSION_KEY) ?? INITIAL_SESSION;
