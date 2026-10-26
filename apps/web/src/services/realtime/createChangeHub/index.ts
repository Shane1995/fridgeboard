import type { ChangeType } from '@fridgeboard/contract/changes';
import { createCoalescer } from '../../coalescer/createCoalescer';
import { createEventBus } from '../../eventBus/createEventBus';
import type {
  ChangeEvent,
  ChangeHub,
  CreateChangeHubOptions,
  InvalidateOnOptions,
  Registration,
} from '../types';

// Where changes from the server are handed out. Anything can listen to a kind of change with
// `subscribe`. The common reaction, refreshing lists, goes through `invalidateOn`: however many
// components ask for the same list on the same kinds of change there is one listener, and a burst
// of changes becomes one refresh.
export const createChangeHub = ({ delayMs, invalidate }: CreateChangeHubOptions): ChangeHub => {
  const bus = createEventBus<ChangeType, ChangeEvent>();
  const coalescer = createCoalescer({ delayMs, flush: invalidate });
  const registrations = new Map<string, Registration>();

  const register = ({ types, keys }: InvalidateOnOptions): Registration => ({
    count: 1,
    unsubscribes: types.map((topic) =>
      bus.subscribe({ topic, listener: () => coalescer.add(keys) }),
    ),
  });

  return {
    emit: (events) => {
      events.forEach((event) => bus.emit({ topic: event.type, event }));
    },
    subscribe: bus.subscribe,
    invalidateOn: (options) => {
      const id = `${options.types.join(',')}|${options.keys.join(',')}`;
      const existing = registrations.get(id);
      if (existing === undefined) {
        registrations.set(id, register(options));
      } else {
        existing.count += 1;
      }
      return () => {
        const entry = registrations.get(id);
        if (entry === undefined) {
          return;
        }
        entry.count -= 1;
        if (entry.count === 0) {
          entry.unsubscribes.forEach((unsubscribe) => unsubscribe());
          registrations.delete(id);
        }
      };
    },
    dispose: coalescer.cancel,
  };
};
