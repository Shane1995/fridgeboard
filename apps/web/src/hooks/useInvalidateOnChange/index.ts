import { useEffect } from 'react';
import { useRealtime } from '../useRealtime';
import type { UseInvalidateOnChangeOptions } from './types';

// The common reaction: when someone else changes these kinds of record, the lists built from them
// are marked stale and fetched again. Every component asking for the same types and keys shares
// one listener. Pass `types` and `keys` as constants.
export const useInvalidateOnChange = ({ types, keys }: UseInvalidateOnChangeOptions): void => {
  const { invalidateOn } = useRealtime();
  useEffect(() => invalidateOn({ types, keys }), [invalidateOn, types, keys]);
};
