import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

// The newest value of something, readable from callbacks that outlive a render (timers, sockets,
// listeners) without making them depend on it. Read `.current` inside the callback.
export const useLatest = <TValue>(value: TValue): RefObject<TValue> => {
  const latest = useRef(value);
  useEffect(() => {
    latest.current = value;
  });
  return latest;
};
