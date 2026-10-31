import { ServerMessage } from '../realtime/constants.ts';
import type { RealtimeHub, Subscriber } from '../realtime/types.ts';

export const createRealtimeHub = (): RealtimeHub => {
  const channels = new Map<string, Set<Subscriber>>();
  return {
    subscribe: ({ channel, subscriber }) => {
      const subscribers = channels.get(channel) ?? new Set<Subscriber>();
      subscribers.add(subscriber);
      channels.set(channel, subscribers);
      return () => {
        subscribers.delete(subscriber);
        if (subscribers.size === 0) {
          channels.delete(channel);
        }
      };
    },
    publish: ({ channel, events }) => {
      const subscribers = [...(channels.get(channel) ?? [])];
      subscribers.forEach((subscriber) =>
        events.forEach((event) =>
          subscriber.send({ type: ServerMessage.Data, id: subscriber.id, event }),
        ),
      );
      return subscribers.length;
    },
  };
};
