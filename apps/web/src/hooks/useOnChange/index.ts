import { useEffect, useRef } from 'react';
import { useRealtime } from '../useRealtime';
import type { UseOnChangeOptions } from './types';

// Runs `onChange` whenever someone else changes one of the kinds of record named in `types`.
// Pass `types` as a constant so the subscription is made once. A resync, such as after being
// offline, arrives as one event per kind with no id.
export const useOnChange = ({ types, onChange }: UseOnChangeOptions): void => {
  const { subscribe } = useRealtime();
  const latest = useRef(onChange);
  useEffect(() => {
    latest.current = onChange;
  });

  useEffect(() => {
    const unsubscribers = types.map((topic) =>
      subscribe({ topic, listener: (event) => latest.current(event) }),
    );
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [subscribe, types]);
};
