import type { Coalescer, CoalescerOptions } from './types';

// Many callers asking for the same thing within a short moment become one call: whatever was
// added is flushed once, without repeats, when `delayMs` has passed since the first add.
export const createCoalescer = ({ delayMs, flush }: CoalescerOptions): Coalescer => {
  const pending = new Set<string>();
  const state: { timer: ReturnType<typeof setTimeout> | undefined } = { timer: undefined };
  return {
    add: (items) => {
      items.forEach((item) => pending.add(item));
      state.timer ??= setTimeout(() => {
        const batch = [...pending];
        pending.clear();
        state.timer = undefined;
        flush(batch);
      }, delayMs);
    },
    cancel: () => {
      clearTimeout(state.timer);
      state.timer = undefined;
      pending.clear();
    },
  };
};
