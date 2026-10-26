import { useInvalidateQueries } from '../useInvalidateQueries';
import { useOnChange } from '../useOnChange';
import type { UseInvalidateOnChangeOptions } from './types';

// The common reaction: when someone else changes these kinds of record, the lists built from them
// are marked stale and fetched again. Pass `types` and `keys` as constants.
export const useInvalidateOnChange = ({ types, keys }: UseInvalidateOnChangeOptions): void => {
  const invalidate = useInvalidateQueries();
  useOnChange({
    types,
    onChange: () => {
      void invalidate({ keys });
    },
  });
};
