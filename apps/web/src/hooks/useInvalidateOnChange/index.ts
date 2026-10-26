import { useOnChange } from '../useOnChange';
import { useRealtime } from '../useRealtime';
import type { UseInvalidateOnChangeOptions } from './types';

// The common reaction: when someone else changes these kinds of record, the lists built from them
// are marked stale and fetched again. Many screens may ask at once, so the provider merges the
// asks into a single refresh. Pass `types` and `keys` as constants.
export const useInvalidateOnChange = ({ types, keys }: UseInvalidateOnChangeOptions): void => {
  const { invalidate } = useRealtime();
  useOnChange({ types, onChange: () => invalidate({ keys }) });
};
