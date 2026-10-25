import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { FINE_POINTER_QUERY } from './constants';

export const useAutoFocus = <T extends HTMLElement>(): RefObject<T | null> => {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (window.matchMedia?.(FINE_POINTER_QUERY).matches) {
      ref.current?.focus();
    }
  }, []);
  return ref;
};
