import type { EventBus, Listener } from './types';

export const createEventBus = <TTopic extends string, TEvent>(): EventBus<TTopic, TEvent> => {
  const listeners = new Map<TTopic, Set<Listener<TEvent>>>();
  return {
    subscribe: ({ topic, listener }) => {
      const forTopic = listeners.get(topic) ?? new Set<Listener<TEvent>>();
      forTopic.add(listener);
      listeners.set(topic, forTopic);
      return () => {
        forTopic.delete(listener);
      };
    },
    emit: ({ topic, event }) => {
      [...(listeners.get(topic) ?? [])].forEach((listener) => listener(event));
    },
  };
};
