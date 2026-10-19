import { sessionListeners } from '../store';
import type { SessionListener } from '../types';

export const subscribeSession = (listener: SessionListener): (() => void) => {
  sessionListeners.add(listener);
  return () => {
    sessionListeners.delete(listener);
  };
};
