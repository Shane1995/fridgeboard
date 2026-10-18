import { sessionListeners } from '../store';

export const subscribeSession = (listener: () => void): (() => void) => {
  sessionListeners.add(listener);
  return () => {
    sessionListeners.delete(listener);
  };
};
